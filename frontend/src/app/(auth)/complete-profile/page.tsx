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
import { DateInput } from '@/components/ui/DateInput';
import { LocationPicker } from '@/components/ui/LocationPicker';
import { GENDER_OPTIONS, SEXUAL_PREFERENCE_OPTIONS, INTEREST_OPTIONS, PHOTO_LIMITS, ROUTES } from '@/lib/constants';
import toast from 'react-hot-toast';

interface FormData {
  gender: string;
  sexualPreference: string;
  bio: string;
  dateOfBirth: Date | undefined;
  location: {
    latitude?: number;
    longitude?: number;
    locationSource: 'gps' | 'ip' | 'manual';
    neighborhood?: string;
  } | undefined;
  interests: string[];
  pictures: File[];
}

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Tell us about yourself' },
  { id: 2, title: 'Birthday', description: 'When were you born?' },
  { id: 3, title: 'Location', description: 'Where are you located?' },
  { id: 4, title: 'Interests', description: 'What do you love?' },
  { id: 5, title: 'Photos', description: 'Show your personality' },
  { id: 6, title: 'Review', description: 'Complete your profile' },
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
    dateOfBirth: undefined,
    location: undefined,
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
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (formData.dateOfBirth) {
        const birthDate = formData.dateOfBirth;
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
        const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
        
        if (actualAge < 18) {
          newErrors.dateOfBirth = 'You must be at least 18 years old';
        } else if (actualAge > 120) {
          newErrors.dateOfBirth = 'Please enter a valid date of birth';
        }
      }
    }

    if (step === 3) {
      if (!formData.location) {
        newErrors.location = 'Location is required';
      } else if (!formData.location.neighborhood && (!formData.location.latitude || !formData.location.longitude)) {
        newErrors.location = 'Please set your location using GPS or enter manually';
      }
    }

    if (step === 4) {
      if (formData.interests.length === 0) newErrors.interests = 'Please select at least one interest';
    }

    if (step === 5) {
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
    if (!validateStep(6)) return;

    try {
      setIsLoading(true);

      // Step 1: Update profile basic info including location
      const profileSuccess = await updateProfile({
        gender: formData.gender,
        sexualPreference: formData.sexualPreference,
        bio: formData.bio,
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString().split('T')[0] : '',
        latitude: formData.location?.latitude,
        longitude: formData.location?.longitude,
        locationSource: formData.location?.locationSource,
        neighborhood: formData.location?.neighborhood,
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="max-w-2xl mx-auto px-4 py-2 sm:py-6">
        {/* Compact Mobile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 sm:mb-6"
        >
          <div className="text-center bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white rounded-xl p-3 sm:p-4">
            <h1 className="text-lg sm:text-2xl font-bold">
              Complete Profile
            </h1>
            <p className="text-xs sm:text-sm text-orange-50 hidden sm:block">
              Let's set up your profile to help you find perfect matches
            </p>
          </div>
        </motion.div>

        {/* Compact Progress Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-between mb-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium ${
                  step.id <= currentStep
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {step.id < currentStep ? <Check size={12} className="sm:hidden" /> : step.id < currentStep ? <Check size={16} className="hidden sm:block" /> : step.id}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
            <motion.div
              className="bg-gradient-to-r from-orange-500 to-amber-500 h-1.5 sm:h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-center mt-1 sm:mt-2">
            <span className="text-xs sm:text-sm text-gray-600">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
            </span>
          </div>
        </div>

        {/* Form Steps */}
        <div className="space-y-4 sm:space-y-6">
          {/* Main Content Area - No Card Wrapper */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg">
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
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                        Basic Information
                      </h2>
                      <p className="text-sm sm:text-base text-gray-600">
                        Tell us about yourself to help us find your perfect matches.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
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
                      <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                        Bio
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself, your interests, and what you're looking for..."
                        rows={4}
                        maxLength={500}
                        className={`w-full px-3 py-2 sm:px-4 sm:py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 resize-none text-sm sm:text-base ${
                          errors.bio ? 'border-red-500' : 'border-gray-200 hover:border-orange-300'
                        }`}
                      />
                      {errors.bio && (
                        <p className="mt-2 text-sm text-red-600 font-medium">{errors.bio}</p>
                      )}
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs sm:text-sm text-gray-500">
                          Share what makes you unique
                        </p>
                        <p className={`text-xs sm:text-sm font-medium ${
                          formData.bio.length > 450 ? 'text-orange-600' : 'text-gray-500'
                          }`}>
                            {formData.bio.length}/500
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Birthday */}
                  {currentStep === 2 && (
                    <div className="space-y-6 sm:space-y-8">
                      <div className="text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                          When were you born?
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
                          Your age will be visible on your profile. You must be at least 18 years old to join.
                        </p>
                      </div>

                      <div className="max-w-md mx-auto">
                        <DateInput
                          label="Date of Birth"
                          value={formData.dateOfBirth}
                          onChange={(date) => setFormData(prev => ({ ...prev, dateOfBirth: date }))}
                          placeholder="Click to select your birthday"
                          maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                          minDate={new Date(new Date().setFullYear(new Date().getFullYear() - 120))}
                          error={errors.dateOfBirth}
                          className="text-sm sm:text-base"
                        />
                      </div>

                      {/* Additional info */}
                      {formData.dateOfBirth && !errors.dateOfBirth && (
                        <div className="text-center">
                          <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-sm text-green-700 font-medium">
                              Perfect! You're {Math.floor((new Date().getTime() - formData.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years old
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Location */}
                  {currentStep === 3 && (
                    <div className="space-y-6 sm:space-y-8">
                      <div className="text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                          Where are you located?
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 max-w-lg mx-auto">
                          Your location helps us connect you with people nearby. We use your general area for matching, not your exact address.
                        </p>
                      </div>

                      <div className="max-w-lg mx-auto">
                        <LocationPicker
                          label="Your Location"
                          value={formData.location}
                          onChange={(location) => setFormData(prev => ({ ...prev, location }))}
                          error={errors.location}
                          className="text-sm sm:text-base"
                        />
                      </div>

                      {/* Location Benefits */}
                      {formData.location && !errors.location && (
                        <div className="text-center">
                          <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-sm text-green-700 font-medium">
                              Location set! You'll see matches in your area
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 4: Interests */}
                  {currentStep === 4 && (
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                          Your Interests
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600">
                          Select your interests to help us find compatible matches.
                        </p>
                      </div>

                      {errors.interests && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 sm:px-4 sm:py-3 rounded-lg">
                          <p className="text-sm font-medium">{errors.interests}</p>
                        </div>
                      )}

                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {formData.interests.map((interest) => (
                            <Badge
                              key={interest}
                              variant="primary"
                              className="px-2 py-1 sm:px-3 sm:py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white cursor-pointer hover:from-orange-600 hover:to-amber-600 transition-all duration-200 text-xs sm:text-sm"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  interests: prev.interests.filter(i => i !== interest)
                                }));
                              }}
                            >
                              {interest} <X size={12} className="ml-1" />
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
                                className="justify-start border-gray-200 hover:border-orange-500 hover:text-orange-600 transition-all duration-200 text-xs sm:text-sm h-8 sm:h-auto"
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
                                <Plus size={12} className="mr-1 sm:mr-2" />
                                {option.label}
                              </Button>
                            ))}
                        </div>

                        <p className="text-xs sm:text-sm text-gray-500 text-center">
                          Selected: {formData.interests.length}/10 interests
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Photos */}
                  {currentStep === 5 && (
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                          Add Photos
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600">
                          Upload photos that showcase your personality and interests.
                        </p>
                      </div>

                      {errors.pictures && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 sm:px-4 sm:py-3 rounded-lg">
                          <p className="text-sm font-medium">{errors.pictures}</p>
                        </div>
                      )}

                      <div className="space-y-3 sm:space-y-4">
                        {/* Upload Area */}
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-8 text-center hover:border-orange-500 transition-all duration-200">
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
                            <Upload size={36} className="mx-auto text-gray-400 mb-2 sm:mb-4 sm:w-12 sm:h-12" />
                            <p className="text-sm sm:text-lg font-medium text-gray-700 mb-1 sm:mb-2">
                              Click to upload photos
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              PNG, JPG, WEBP up to 5MB each (max {PHOTO_LIMITS.MAX_PHOTOS} photos)
                            </p>
                          </label>
                        </div>

                        {/* Preview Uploaded Photos */}
                        {formData.pictures.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
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
                                  className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                >
                                  <X size={14} className="sm:w-4 sm:h-4" />
                                </button>
                                {index === 0 && (
                                  <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-orange-500 text-white text-xs px-1 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium">
                                    Main
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <p className="text-xs sm:text-sm text-gray-500 text-center">
                          {formData.pictures.length}/{PHOTO_LIMITS.MAX_PHOTOS} photos uploaded
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 6: Review */}
                  {currentStep === 6 && (
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                          Review Your Profile
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600">
                          Take a moment to review your information before completing your profile.
                        </p>
                      </div>

                      <div className="space-y-4 sm:space-y-6">
                        {/* Basic Info Review */}
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Basic Information</h3>
                          <div className="space-y-2 sm:space-y-3">
                            <div className="grid grid-cols-2 gap-2 sm:gap-4">
                              <div>
                                <p className="text-xs sm:text-sm text-gray-600">Gender</p>
                                <p className="text-sm sm:text-base font-medium">{GENDER_OPTIONS.find(g => g.value === formData.gender)?.label}</p>
                              </div>
                              <div>
                                <p className="text-xs sm:text-sm text-gray-600">Looking for</p>
                                <p className="text-sm sm:text-base font-medium">{SEXUAL_PREFERENCE_OPTIONS.find(s => s.value === formData.sexualPreference)?.label}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm text-gray-600">Bio</p>
                              <p className="text-sm sm:text-base font-medium">{formData.bio}</p>
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm text-gray-600">Date of Birth</p>
                              <p className="text-sm sm:text-base font-medium">
                                {formData.dateOfBirth && new Date(formData.dateOfBirth).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })} 
                                ({Math.floor((new Date().getTime() - new Date(formData.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years old)
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Interests Review */}
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Interests ({formData.interests.length})</h3>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {formData.interests.map((interest) => (
                              <Badge
                                key={interest}
                                variant="secondary"
                                className="bg-orange-100 text-orange-800 text-xs sm:text-sm px-2 py-1"
                              >
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Photos Review */}
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Photos ({formData.pictures.length})</h3>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
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
                                  <div className="absolute bottom-1 left-1 bg-orange-500 text-white text-xs px-1 py-0.5 rounded">
                                    Main
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-3 pt-2 sm:pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-3 sm:px-6 text-sm sm:text-base"
            >
              <ArrowLeft size={14} className="mr-1 sm:mr-2 sm:w-4 sm:h-4" />
              Previous
            </Button>

            {currentStep < STEPS.length ? (
              <Button
                onClick={handleNext}
                className="px-3 sm:px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-sm sm:text-base"
              >
                Next
                <ArrowRight size={14} className="ml-1 sm:ml-2 sm:w-4 sm:h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                loading={isLoading}
                className="px-4 sm:px-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-sm sm:text-base"
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