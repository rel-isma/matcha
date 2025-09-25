// Complete Profile Page - Wizard/Stepper Interface
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Upload, X, Plus, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { GENDER_OPTIONS, SEXUAL_PREFERENCE_OPTIONS, INTEREST_OPTIONS, PHOTO_LIMITS, ROUTES } from '../../lib/constants';
import toast from 'react-hot-toast';

interface FormData {
  gender: string;
  sexualPreference: string;
  bio: string;
  interests: string[];
  pictures: File[];
}

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Tell us about yourself' },
  { id: 2, title: 'Interests', description: 'What do you love?' },
  { id: 3, title: 'Photos', description: 'Show your personality' },
  { id: 4, title: 'Review', description: 'Complete your profile' },
];

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { updateProfile, uploadPicture, addInterests } = useProfile();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    gender: '',
    sexualPreference: '',
    bio: '',
    interests: [],
    pictures: [],
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Validate current step
  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (step === 1) {
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.sexualPreference) newErrors.sexualPreference = 'Sexual preference is required';
      if (!formData.bio.trim()) newErrors.bio = 'Bio is required';
      if (formData.bio.trim().length < 10) newErrors.bio = 'Bio must be at least 10 characters';
    }

    if (step === 2) {
      if (formData.interests.length === 0) newErrors.interests = 'Please select at least one interest';
    }

    if (step === 3) {
      if (formData.pictures.length === 0) newErrors.pictures = 'Please upload at least one photo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).filter(file => {
      // Check file type
      if (!PHOTO_LIMITS.ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a supported image format`);
        return false;
      }
      
      // Check file size
      if (file.size > PHOTO_LIMITS.MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      
      return true;
    });

    const totalFiles = formData.pictures.length + newFiles.length;
    if (totalFiles > PHOTO_LIMITS.MAX_PHOTOS) {
      toast.error(`You can only upload ${PHOTO_LIMITS.MAX_PHOTOS} photos maximum`);
      return;
    }

    setFormData(prev => ({
      ...prev,
      pictures: [...prev.pictures, ...newFiles]
    }));
  };

  // Remove picture
  const removePicture = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pictures: prev.pictures.filter((_, i) => i !== index)
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    try {
      setIsLoading(true);

      // Step 1: Update profile basic info
      const profileSuccess = await updateProfile({
        gender: formData.gender,
        sexualPreference: formData.sexualPreference,
        bio: formData.bio,
      });

      if (!profileSuccess) {
        throw new Error('Failed to update profile');
      }

      // Step 2: Upload pictures
      const picturePromises = formData.pictures.map(file => uploadPicture(file));
      const pictureResults = await Promise.all(picturePromises);
      
      if (pictureResults.some(result => !result)) {
        throw new Error('Failed to upload some pictures');
      }

      // Step 3: Add interests
      const interestsSuccess = await addInterests(formData.interests);
      
      if (!interestsSuccess) {
        throw new Error('Failed to add interests');
      }

      toast.success('Profile completed successfully!');
      router.push(ROUTES.PROFILE);
      
    } catch (error) {
      toast.error('Failed to complete profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Progress percentage
  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Let's set up your profile to help you find perfect matches
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step.id <= currentStep
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                }`}
              >
                {step.id < currentStep ? <Check size={16} /> : step.id}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <motion.div
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-center mt-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
            </span>
          </div>
        </div>

        {/* Form Steps */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Basic Information
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300">
                        Tell us about yourself to help us find your perfect matches.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <Select
                        label="Gender"
                        options={GENDER_OPTIONS}
                        value={formData.gender}
                        onChange={(value) => setFormData(prev => ({ ...prev, gender: value as string }))}
                        placeholder="Select your gender"
                        error={errors.gender}
                      />

                      <Select
                        label="Sexual Preference"
                        options={SEXUAL_PREFERENCE_OPTIONS}
                        value={formData.sexualPreference}
                        onChange={(value) => setFormData(prev => ({ ...prev, sexualPreference: value as string }))}
                        placeholder="Who are you interested in?"
                        error={errors.sexualPreference}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself, your interests, and what you're looking for..."
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          errors.bio ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.bio && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bio}</p>
                      )}
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {formData.bio.length}/500 characters
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 2: Interests */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Your Interests
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300">
                        Select interests that describe you. This helps us find people with common interests.
                      </p>
                    </div>

                    <Select
                      label="Select Interests"
                      options={INTEREST_OPTIONS}
                      value={formData.interests}
                      onChange={(value) => setFormData(prev => ({ ...prev, interests: value as string[] }))}
                      placeholder="Search and select interests"
                      searchable
                      multiSelect
                      error={errors.interests}
                      maxHeight={300}
                    />

                    {/* Selected Interests Display */}
                    {formData.interests.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Selected Interests ({formData.interests.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {formData.interests.map((interest) => {
                            const interestOption = INTEREST_OPTIONS.find(opt => opt.value === interest);
                            return (
                              <Badge
                                key={interest}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {interestOption?.label}
                                <button
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    interests: prev.interests.filter(i => i !== interest)
                                  }))}
                                  className="hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-1"
                                >
                                  <X size={12} />
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Photos */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Add Photos
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300">
                        Upload at least one photo. You can add up to {PHOTO_LIMITS.MAX_PHOTOS} photos.
                      </p>
                    </div>

                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                      <input
                        type="file"
                        multiple
                        accept={PHOTO_LIMITS.ALLOWED_TYPES.join(',')}
                        onChange={handleFileUpload}
                        className="hidden"
                        id="photo-upload"
                        disabled={formData.pictures.length >= PHOTO_LIMITS.MAX_PHOTOS}
                      />
                      <label
                        htmlFor="photo-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Click to upload photos
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          JPG, PNG, WEBP up to 5MB each
                        </p>
                      </label>
                    </div>

                    {errors.pictures && (
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.pictures}</p>
                    )}

                    {/* Photo Preview */}
                    {formData.pictures.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Uploaded Photos ({formData.pictures.length}/{PHOTO_LIMITS.MAX_PHOTOS})
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {formData.pictures.map((file, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <button
                                onClick={() => removePicture(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={16} />
                              </button>
                              {index === 0 && (
                                <div className="absolute bottom-2 left-2">
                                  <Badge variant="secondary" className="text-xs">
                                    Profile Photo
                                  </Badge>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Review */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Review & Complete
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300">
                        Review your profile information before completing.
                      </p>
                    </div>

                    {/* Review Content */}
                    <div className="space-y-6">
                      {/* Basic Info */}
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Basic Information</h3>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Gender:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">
                              {GENDER_OPTIONS.find(g => g.value === formData.gender)?.label}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Preference:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">
                              {SEXUAL_PREFERENCE_OPTIONS.find(p => p.value === formData.sexualPreference)?.label}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="text-gray-500 dark:text-gray-400">Bio:</span>
                          <p className="mt-1 text-gray-900 dark:text-white">{formData.bio}</p>
                        </div>
                      </div>

                      {/* Interests */}
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                          Interests ({formData.interests.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {formData.interests.map((interest) => {
                            const interestOption = INTEREST_OPTIONS.find(opt => opt.value === interest);
                            return (
                              <Badge key={interest} variant="secondary">
                                {interestOption?.label}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>

                      {/* Photos */}
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                          Photos ({formData.pictures.length})
                        </h3>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                          {formData.pictures.map((file, index) => (
                            <div key={index} className="aspect-square rounded-lg overflow-hidden">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Previous
              </Button>

              {currentStep < STEPS.length ? (
                <Button
                  onClick={handleNext}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight size={16} />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  loading={isLoading}
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  Complete Account
                  <Check size={16} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
