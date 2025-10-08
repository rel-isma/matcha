// Complete Profile Page - Beautiful Modern Design
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, X, Plus, Camera } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { LocationPicker } from '@/components/ui/LocationPicker';
import { GENDER_OPTIONS, SEXUAL_PREFERENCE_OPTIONS, INTEREST_OPTIONS, PHOTO_LIMITS, ROUTES } from '@/lib/constants';
import toast from 'react-hot-toast';

interface FormData {
  gender: string;
  sexualPreference: string;
  bio: string;
  dateOfBirth: string;
  location: {
    latitude?: number;
    longitude?: number;
    locationSource: 'gps' | 'manual' | 'default';
    neighborhood?: string;
  } | undefined;
  interests: string[];
  pictures: File[];
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const { updateProfile, uploadPicture, addInterests } = useProfile();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    gender: '',
    sexualPreference: '',
    bio: '',
    dateOfBirth: '',
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
      
      // Date of birth validation
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Date of birth is required';
      } else {
        const birthDate = new Date(formData.dateOfBirth);
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

    if (step === 2) {
      if (!formData.location) {
        newErrors.location = 'Location is required';
      } else if (!formData.location.neighborhood && (!formData.location.latitude || !formData.location.longitude)) {
        newErrors.location = 'Please set your location using GPS or enter manually';
      }
    }

    if (step === 3) {
      if (formData.interests.length === 0) newErrors.interests = 'Please select at least one interest';
    }

    if (step === 4) {
      if (formData.pictures.length === 0) newErrors.pictures = 'Please upload at least one photo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
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
      if (!PHOTO_LIMITS.ALLOWED_TYPES.includes(file.type as any)) {
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
    if (!validateStep(5)) return;

    try {
      setIsLoading(true);

      // Step 1: Update profile basic info including location
      const profileSuccess = await updateProfile({
        gender: formData.gender,
        sexualPreference: formData.sexualPreference,
        bio: formData.bio,
        dateOfBirth: formData.dateOfBirth,
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
      
    } catch {
      toast.error('Failed to complete profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-col">
      {/* Mobile Layout */}
      <div className="md:hidden flex-1 flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-6 py-8">
          {/* Main Content Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/60 flex-1 min-h-0 overflow-auto relative">
            {/* Card background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 via-purple-50/30 to-blue-50/50 rounded-3xl"></div>
            
            {/* Form content */}
            <div className="relative z-10">
              {renderStepContent()}
            </div>
            
            {/* Decorative corner elements */}
            <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-pink-300 to-rose-400 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-br from-purple-300 to-indigo-400 rounded-full opacity-25 animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>

          {/* Navigation with circular progress */}
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-3 rounded-full border-2 border-orange-300/60 bg-white/80 backdrop-blur hover:bg-white/90 hover:border-orange-400 disabled:opacity-50 disabled:border-gray-300/40 disabled:bg-gray-100/40 transition-all duration-200 font-medium text-gray-800 shadow-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {/* Circular Progress Indicator */}
            <div className="flex space-x-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index + 1}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    (index + 1) <= currentStep 
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-sm' 
                      : 'bg-white/40 backdrop-blur'
                  }`}
                />
              ))}
            </div>

            {currentStep === 5 ? (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full shadow-lg font-semibold transition-all duration-200 hover:shadow-xl"
              >
                {isLoading ? 'Creating...' : 'Complete'}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full shadow-lg font-semibold transition-all duration-200 hover:shadow-xl"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block flex-1">
        <div className="h-full flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-4xl">
            {/* Main Content Card */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/60 mb-8 relative overflow-hidden">
              {/* Card background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 via-purple-50/30 to-blue-50/50 rounded-3xl"></div>
              
              {/* Form content */}
              <div className="relative z-10">
                {renderStepContent()}
              </div>
              
              {/* Decorative corner elements */}
              <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-pink-300 to-rose-400 rounded-full opacity-30 animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-br from-purple-300 to-indigo-400 rounded-full opacity-25 animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>

            {/* Desktop Navigation with circular progress */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="px-8 py-4 rounded-full border-2 border-orange-300/60 bg-white/80 backdrop-blur hover:bg-white/90 hover:border-orange-400 disabled:opacity-50 disabled:border-gray-300/40 disabled:bg-gray-100/40 transition-all duration-200 font-medium text-gray-800 shadow-lg"
              >
                <ArrowLeft className="w-5 h-5 mr-3" />
                Previous
              </Button>

              {/* Circular Progress Indicator */}
              <div className="flex space-x-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index + 1}
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      (index + 1) <= currentStep 
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg' 
                        : 'bg-white/40 backdrop-blur'
                    }`}
                  />
                ))}
              </div>

              {currentStep === 5 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-12 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full shadow-lg text-lg font-semibold transition-all duration-200 hover:shadow-xl"
                >
                  {isLoading ? 'Creating Profile...' : 'Complete Profile'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="px-10 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full shadow-lg font-semibold transition-all duration-200 hover:shadow-xl"
                >
                  Next Step
                  <ArrowRight className="w-5 h-5 ml-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render step content function
  function renderStepContent() {
    return (
      <div className="space-y-4">
        {/* Step 1: About You */}
        {currentStep === 1 && (
          <div className="space-y-3">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                About You
              </h2>
              <p className="text-gray-600 text-sm">
                Tell us about yourself to help us find your perfect matches
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <Select
                  value={formData.gender}
                  onChange={(value) => setFormData(prev => ({ ...prev, gender: value as string }))}
                  options={GENDER_OPTIONS as any}
                  placeholder="Select"
                  className={errors.gender ? 'border-red-300' : ''}
                />
                {errors.gender && (
                  <p className="mt-1 text-xs text-red-500">{errors.gender}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Looking for
                </label>
                <Select
                  value={formData.sexualPreference}
                  onChange={(value) => setFormData(prev => ({ ...prev, sexualPreference: value as string }))}
                  options={SEXUAL_PREFERENCE_OPTIONS as any}
                  placeholder="Select"
                  className={errors.sexualPreference ? 'border-red-300' : ''}
                />
                {errors.sexualPreference && (
                  <p className="mt-1 text-xs text-red-500">{errors.sexualPreference}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About You
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none ${
                  errors.bio ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              <div className="flex justify-between items-center mt-2">
                {errors.bio && (
                  <p className="text-xs text-red-500">{errors.bio}</p>
                )}
                <p className="text-xs text-gray-500 ml-auto">
                  {formData.bio.length}/500
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                min={new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.dateOfBirth ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-xs text-red-500">{errors.dateOfBirth}</p>
              )}
              {formData.dateOfBirth && !errors.dateOfBirth && (
                <p className="mt-1 text-xs text-green-600">
                  You&apos;re {Math.floor((new Date().getTime() - new Date(formData.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years old
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {currentStep === 2 && (
          <div className="space-y-3">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                Your Location
              </h2>
              <p className="text-gray-600 text-sm">
                Your location helps us connect you with people nearby
              </p>
            </div>

            <LocationPicker
              label="Your Location"
              value={formData.location}
              onChange={(location) => setFormData(prev => ({ ...prev, location }))}
              error={errors.location}
            />

            {formData.location && !errors.location && (
              <div className="text-center">
                <div className="inline-flex items-center px-3 py-1 bg-orange-50 border border-orange-200 rounded-full">
                  <span className="text-sm text-orange-700">
                    Location set!
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Interests */}
        {currentStep === 3 && (
          <div className="space-y-3">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                Your Interests
              </h2>
              <p className="text-gray-600 text-sm">
                Select a few of your interests to match with users who have similar things in common
              </p>
            </div>

            {errors.interests && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg">
                <p className="text-sm">{errors.interests}</p>
              </div>
            )}

            <div className="space-y-3">
              {formData.interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.interests.map((interest) => (
                    <span
                      key={interest}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          interests: prev.interests.filter(i => i !== interest)
                        }));
                      }}
                      className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm rounded-full cursor-pointer hover:from-orange-600 hover:to-amber-600"
                    >
                      {interest}
                      <X size={14} className="ml-1" />
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {INTEREST_OPTIONS
                  .filter(option => !formData.interests.includes(option.value))
                  .map((option) => (
                    <button
                      key={option.value}
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
                      className="text-left px-3 py-2 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 text-sm"
                    >
                      {option.label}
                    </button>
                  ))}
              </div>

              <p className="text-xs text-gray-500 text-center">
                {formData.interests.length}/10 selected
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Photos */}
        {currentStep === 4 && (
          <div className="space-y-3">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                Your Photos
              </h2>
              <p className="text-gray-600 text-sm">
                Add your best photos to get a higher amount of daily matches
              </p>
            </div>

            {errors.pictures && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg">
                <p className="text-sm">{errors.pictures}</p>
              </div>
            )}

            <div className="space-y-3">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-orange-300">
                <input
                  type="file"
                  id="photo-upload"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="w-12 h-12 mx-auto mb-2 bg-orange-100 rounded-full flex items-center justify-center">
                    <Camera size={24} className="text-orange-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Add photos</p>
                  <p className="text-xs text-gray-500">Up to {PHOTO_LIMITS.MAX_PHOTOS} photos</p>
                </label>
              </div>

              {/* Photo Grid */}
              {formData.pictures.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                      {formData.pictures[index] ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={URL.createObjectURL(formData.pictures[index])}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removePicture(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-1 left-1 bg-orange-500 text-white text-xs px-1 rounded">
                              Main
                            </div>
                          )}
                        </>
                      ) : (
                        <label htmlFor="photo-upload" className="w-full h-full flex items-center justify-center cursor-pointer">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <Plus size={16} className="text-orange-500" />
                          </div>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-3">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                Review Your Profile
              </h2>
              <p className="text-gray-600 text-sm">
                Take a moment to review your information before completing
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-orange-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-800 mb-2">Basic Info</h4>
                <p className="text-sm text-gray-600">
                  {GENDER_OPTIONS.find(g => g.value === formData.gender)?.label}, looking for{' '}
                  {SEXUAL_PREFERENCE_OPTIONS.find(s => s.value === formData.sexualPreference)?.label}
                </p>
                <p className="text-sm text-gray-600 mt-1">{formData.bio}</p>
              </div>

              <div className="bg-amber-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-800 mb-2">
                  Interests ({formData.interests.length})
                </h4>
                <div className="flex flex-wrap gap-1">
                  {formData.interests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-block px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-800 mb-2">
                  Photos ({formData.pictures.length})
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {formData.pictures.map((file, index) => (
                    <div key={index} className="aspect-square rounded overflow-hidden bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}