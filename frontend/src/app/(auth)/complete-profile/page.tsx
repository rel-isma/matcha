// Complete Profile Page - Wizard/Stepper Interface
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Upload, X, Plus, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { GENDER_OPTIONS, SEXUAL_PREFERENCE_OPTIONS, INTEREST_OPTIONS, PHOTO_LIMITS, ROUTES } from '@/lib/constants';
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
      // Redirect to browse page after completing profile
      router.push(ROUTES.BROWSE);
      
    } catch (error) {
      toast.error('Failed to complete profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Progress percentage
  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 py-4 sm:py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Enhanced Header */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600">
              <CardContent className="p-3 sm:p-4 text-white">
                <div className="text-center">
                  <h1 className="text-xl sm:text-2xl font-bold mb-2">
                    Complete Your Profile
                  </h1>
                  <p className="text-orange-50">
                    Let's set up your profile to help you find perfect matches
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step.id <= currentStep
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {step.id < currentStep ? <Check size={16} /> : step.id}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-center mt-2">
            <span className="text-sm text-gray-600">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
            </span>
          </div>
        </div>

        {/* Form Steps */}
        <div className="space-y-6 sm:space-y-8">
          <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8">
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
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                          Basic Information
                        </h2>
                        <p className="text-gray-600">
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
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Bio
                        </label>
                        <textarea
                          value={formData.bio}
                          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                          placeholder="Tell us about yourself, your interests, and what you're looking for..."
                          rows={5}
                          maxLength={500}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 resize-none ${
                            errors.bio ? 'border-red-500' : 'border-gray-200 hover:border-orange-300'
                          }`}
                        />
                        {errors.bio && (
                          <p className="mt-2 text-sm text-red-600 font-medium">{errors.bio}</p>
                        )}
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-sm text-gray-500">
                            Share what makes you unique
                          </p>
                          <p className={`text-sm font-medium ${
                            formData.bio.length > 450 ? 'text-orange-600' : 'text-gray-500'
                          }`}>
                            {formData.bio.length}/500
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Interests */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                          Your Interests
                        </h2>
                        <p className="text-gray-600">
                          Select your interests to help us find compatible matches.
                        </p>
                      </div>

                      {errors.interests && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                          <p className="text-sm font-medium">{errors.interests}</p>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {formData.interests.map((interest) => (
                            <Badge
                              key={interest}
                              variant="primary"
                              className="px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white cursor-pointer hover:from-orange-600 hover:to-amber-600 transition-all duration-200"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  interests: prev.interests.filter(i => i !== interest)
                                }));
                              }}
                            >
                              {interest} <X size={14} className="ml-1" />
                            </Badge>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {INTEREST_OPTIONS
                            .filter(option => !formData.interests.includes(option.value))
                            .map((option) => (
                              <Button
                                key={option.value}
                                variant="outline"
                                size="sm"
                                className="justify-start border-gray-200 hover:border-orange-500 hover:text-orange-600 transition-all duration-200"
                                onClick={() => {
                                  if (formData.interests.length < 10) {
                                    setFormData(prev => ({
                                      ...prev,
                                      interests: [...prev.interests, option.value]
                                    }));
                                  } else {
                                    toast.error('You can select up to 10 interests');
                                  }
                                }}
                              >
                                <Plus size={14} className="mr-2" />
                                {option.label}
                              </Button>
                            ))}
                        </div>

                        <p className="text-sm text-gray-500 text-center">
                          Selected: {formData.interests.length}/10 interests
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Photos */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                          Add Photos
                        </h2>
                        <p className="text-gray-600">
                          Upload photos that showcase your personality and interests.
                        </p>
                      </div>

                      {errors.pictures && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                          <p className="text-sm font-medium">{errors.pictures}</p>
                        </div>
                      )}

                      <div className="space-y-4">
                        {/* Upload Area */}
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-500 transition-all duration-200">
                          <input
                            type="file"
                            id="photo-upload"
                            multiple
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <label
                            htmlFor="photo-upload"
                            className="cursor-pointer"
                          >
                            <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-lg font-medium text-gray-700 mb-2">
                              Click to upload photos
                            </p>
                            <p className="text-sm text-gray-500">
                              PNG, JPG, WEBP up to 5MB each (max {PHOTO_LIMITS.MAX_PHOTOS} photos)
                            </p>
                          </label>
                        </div>

                        {/* Preview Uploaded Photos */}
                        {formData.pictures.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {formData.pictures.map((file, index) => (
                              <div
                                key={index}
                                className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100"
                              >
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  onClick={() => removePicture(index)}
                                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                >
                                  <X size={16} />
                                </button>
                                {index === 0 && (
                                  <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                    Main Photo
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <p className="text-sm text-gray-500 text-center">
                          {formData.pictures.length}/{PHOTO_LIMITS.MAX_PHOTOS} photos uploaded
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Review */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                          Review Your Profile
                        </h2>
                        <p className="text-gray-600">
                          Take a moment to review your information before completing your profile.
                        </p>
                      </div>

                      <div className="space-y-6">
                        {/* Basic Info Review */}
                        <Card className="border-gray-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Basic Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Gender</p>
                                <p className="font-medium">{GENDER_OPTIONS.find(g => g.value === formData.gender)?.label}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Looking for</p>
                                <p className="font-medium">{SEXUAL_PREFERENCE_OPTIONS.find(s => s.value === formData.sexualPreference)?.label}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Bio</p>
                              <p className="font-medium">{formData.bio}</p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Interests Review */}
                        <Card className="border-gray-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Interests ({formData.interests.length})</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {formData.interests.map((interest) => (
                                <Badge
                                  key={interest}
                                  variant="secondary"
                                  className="bg-orange-100 text-orange-800"
                                >
                                  {interest}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Photos Review */}
                        <Card className="border-gray-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Photos ({formData.pictures.length})</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                              {formData.pictures.map((file, index) => (
                                <div
                                  key={index}
                                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                                >
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Photo ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  {index === 0 && (
                                    <div className="absolute bottom-1 left-1 bg-orange-500 text-white text-xs px-1 py-0.5 rounded text-center">
                                      Main
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6"
            >
              <ArrowLeft size={16} className="mr-2" />
              Previous
            </Button>

            {currentStep < STEPS.length ? (
              <Button
                onClick={handleNext}
                className="px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                Next
                <ArrowRight size={16} className="ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                loading={isLoading}
                className="px-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                {isLoading ? 'Completing...' : 'Complete Profile'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}