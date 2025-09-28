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
    <div className="py-4 sm:py-8">
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
                          Select interests that describe you. This helps us find people with common interests.
                        </p>
                      </div>

                      {/* Selected Interests Display - Moved above the select */}
                      {formData.interests.length > 0 && (
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                          <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            Selected Interests 
                            <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 rounded-full">
                              {formData.interests.length}
                            </span>
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {formData.interests.map((interest) => {
                              const interestOption = INTEREST_OPTIONS.find(opt => opt.value === interest);
                              return (
                                <Badge
                                  key={interest}
                                  className="flex items-center gap-1 bg-white text-orange-800 border-orange-200 hover:bg-orange-50 transition-colors shadow-sm"
                                >
                                  {interestOption?.label}
                                  <button
                                    onClick={() => setFormData(prev => ({
                                      ...prev,
                                      interests: prev.interests.filter(i => i !== interest)
                                    }))}
                                    className="hover:bg-red-200 rounded-full p-1 transition-colors ml-1"
                                  >
                                    <X size={12} />
                                  </button>
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <Select
                        label="Add More Interests"
                        options={INTEREST_OPTIONS.filter(option => !formData.interests.includes(option.value))}
                        value={[]}
                        onChange={(value) => {
                          const newInterests = value as string[];
                          if (newInterests.length > 0) {
                            setFormData(prev => ({
                              ...prev,
                              interests: [...prev.interests, ...newInterests]
                            }));
                          }
                        }}
                        placeholder={formData.interests.length > 0 ? "Add more interests..." : "Search and select interests"}
                        searchable
                        multiSelect
                        error={errors.interests}
                        maxHeight={300}
                      />

                      {formData.interests.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Plus className="w-8 h-8 text-orange-600" />
                          </div>
                          <p className="text-sm">Select interests to get started</p>
                        </div>
                      )}
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
                          Upload at least one photo. You can add up to {PHOTO_LIMITS.MAX_PHOTOS} photos.
                        </p>
                      </div>

                      {/* Upload Area */}
                      <div className="border-2 border-dashed border-orange-200 rounded-xl p-6 text-center bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 transition-colors duration-200">
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
                          className="cursor-pointer flex flex-col items-center group"
                        >
                          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                            <Upload className="h-6 w-6 text-white" />
                          </div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">
                            Click to upload photos
                          </p>
                          <p className="text-xs text-gray-500">
                            JPG, PNG, WEBP up to 5MB each
                          </p>
                        </label>
                      </div>

                      {errors.pictures && (
                        <p className="text-sm text-red-600 font-medium">{errors.pictures}</p>
                      )}

                      {/* Photo Preview */}
                      {formData.pictures.length > 0 && (
                        <div>
                          <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            Uploaded Photos
                            <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 rounded-full">
                              {formData.pictures.length}/{PHOTO_LIMITS.MAX_PHOTOS}
                            </span>
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {formData.pictures.map((file, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-md group-hover:shadow-lg transition-shadow duration-200">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <button
                                  onClick={() => removePicture(index)}
                                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                  <X size={16} />
                                </button>
                                {index === 0 && (
                                  <div className="absolute top-2 left-2">
                                    <Badge className="text-xs bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-md">
                                      Main Photo
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
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                          Review & Complete
                        </h2>
                        <p className="text-gray-600">
                          Review your profile information before completing.
                        </p>
                      </div>

                      {/* Review Content */}
                      <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                          <h3 className="font-semibold text-gray-800 mb-4 text-lg">Basic Information</h3>
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 font-medium">Gender:</span>
                              <span className="ml-2 text-gray-800 font-semibold">
                                {GENDER_OPTIONS.find(g => g.value === formData.gender)?.label}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Preference:</span>
                              <span className="ml-2 text-gray-800 font-semibold">
                                {SEXUAL_PREFERENCE_OPTIONS.find(p => p.value === formData.sexualPreference)?.label}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4">
                            <span className="text-gray-600 font-medium">Bio:</span>
                            <p className="mt-2 text-gray-800 bg-white/50 rounded-lg p-3 border border-orange-200">{formData.bio}</p>
                          </div>
                        </div>

                        {/* Interests */}
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                          <h3 className="font-semibold text-gray-800 mb-4 text-lg flex items-center gap-2">
                            Interests 
                            <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 rounded-full">
                              {formData.interests.length}
                            </span>
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {formData.interests.map((interest) => {
                              const interestOption = INTEREST_OPTIONS.find(opt => opt.value === interest);
                              return (
                                <Badge 
                                  key={interest} 
                                  className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200"
                                >
                                  {interestOption?.label}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>

                        {/* Photos */}
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                          <h3 className="font-semibold text-gray-800 mb-4 text-lg flex items-center gap-2">
                            Photos 
                            <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 rounded-full">
                              {formData.pictures.length}
                            </span>
                          </h3>
                          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                            {formData.pictures.map((file, index) => (
                              <div key={index} className="aspect-square rounded-lg overflow-hidden shadow-md">
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
              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 pt-6 border-t border-orange-200">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="w-full sm:w-auto px-8 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-xl transition-all duration-200"
                >
                  <ArrowLeft size={16} />
                  Previous
                </Button>

                {currentStep < STEPS.length ? (
                  <Button
                    onClick={handleNext}
                    className="w-full sm:w-auto bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:via-amber-600 hover:to-orange-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    Next
                    <ArrowRight size={16} />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full sm:w-auto bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:via-amber-600 hover:to-orange-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        Complete Account
                        <Check size={16} />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
