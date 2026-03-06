'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, X, Plus, Camera, Calendar, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ProfileGPSPicker } from '@/components/ui';
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
  const { updateUser } = useAuth();
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
      if (formData.location && !formData.location.neighborhood && (!formData.location.latitude || !formData.location.longitude)) {
        newErrors.location = 'Please set your location using GPS or enter manually, or skip this step';
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

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        handleSubmit();
      }
    }
  };

  const handleSkipLocation = () => {
    if (currentStep === 2) {
      setFormData(prev => ({ ...prev, location: undefined }));
      setErrors(prev => ({ ...prev, location: '' }));
      setCurrentStep(3);
    }
  };  

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).filter(file => {
      if (!PHOTO_LIMITS.ALLOWED_TYPES.includes(file.type as typeof PHOTO_LIMITS.ALLOWED_TYPES[number])) {
        toast.error(`${file.name} is not a supported image format`);
        return false;
      }
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

  const removePicture = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pictures: prev.pictures.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    try {
      setIsLoading(true);

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

      // Upload pictures sequentially to avoid race conditions with primary picture assignment
      const pictureResults = [];
      for (const file of formData.pictures) {
        const result = await uploadPicture(file);
        if (!result) {
          throw new Error('Failed to upload a picture');
        }
        pictureResults.push(result);
      }

      const interestsSuccess = await addInterests(formData.interests);
      if (!interestsSuccess) {
        throw new Error('Failed to add interests');
      }

      await updateUser();

      toast.success('Profile completed successfully!');
      router.push(ROUTES.BROWSE);
      
    } catch {
      toast.error('Failed to complete profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-[#1e293b]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden">
          
          {/* Header & Progress */}
          <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-white/5 bg-white/[0.02]">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                Profile Setup
              </h1>
              <span className="text-sm font-medium text-muted-foreground bg-white/5 px-3 py-1 rounded-full">
                Step {currentStep} of 5
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-[#334155] rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent transition-all duration-300 ease-in-out"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8 flex-1">
            {renderStepContent()}
          </div>
          
          {/* Footer Navigation */}
          <div className="px-6 py-5 sm:px-8 border-t border-white/5 bg-[#1e293b] flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`px-6 h-11 w-full sm:w-auto font-medium transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'} text-foreground border-white/10 hover:bg-white/5 hover:border-white/20`}
            >
              Back
            </Button>

            {currentStep === 5 ? (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-8 h-11 w-full sm:w-auto bg-accent hover:bg-accent/90 text-white font-medium shadow-lg shadow-accent/20"
              >
                {isLoading ? 'Saving...' : 'Complete Profile'}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="px-8 h-11 w-full sm:w-auto bg-accent hover:bg-accent/90 text-white font-medium shadow-lg shadow-accent/20"
              >
                Continue
              </Button>
            )}
          </div>

        </div>
      </div>
    </div>
  );

  function renderStepContent() {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* Step 1: About You */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-white">About You</h2>
              <p className="text-sm text-muted-foreground">
                Help us find your perfect matches by sharing a bit about yourself.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2 ">
                <label className="text-sm font-medium text-foreground">Gender</label>
                <Select
                  value={formData.gender}
                  onChange={(value) => {
                    const newGender = value as string;
                    const autoPreference = newGender === 'male' ? 'female' : newGender === 'female' ? 'male' : '';
                    setFormData(prev => ({ 
                      ...prev, 
                      gender: newGender,
                      sexualPreference: autoPreference
                    }));
                  }}
                  options={[...GENDER_OPTIONS]}
                  placeholder="Select"
                  className=""
                  buttonClassName={errors.gender ? 'border-destructive' : 'bg-[#0f1729] border-white/10'}
                />
                {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Looking for</label>
                <Select
                  value={formData.sexualPreference}
                  onChange={(value) => setFormData(prev => ({ ...prev, sexualPreference: value as string }))}
                  options={[...SEXUAL_PREFERENCE_OPTIONS]}
                  placeholder="Select"
                  className=""
                  buttonClassName={errors.sexualPreference ? 'border-destructive' : 'bg-[#0f1729] border-white/10'}
                />
                {errors.sexualPreference && <p className="text-xs text-destructive">{errors.sexualPreference}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Date of Birth</label>
              <div className="relative group">
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  min={new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString().split('T')[0]}
                  className={`w-full px-4 py-2.5 bg-[#0f1729] border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-white transition-colors [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer ${
                    errors.dateOfBirth ? 'border-destructive' : 'border-white/10 hover:border-white/20'
                  }`}
                  style={{ colorScheme: 'dark' }}
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-foreground transition-colors">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              {errors.dateOfBirth && <p className="text-xs text-destructive">{errors.dateOfBirth}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Share your interests, what you do, or what you're looking for..."
                rows={4}
                className={`w-full px-4 py-3 bg-[#0f1729] border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-white placeholder:text-muted-foreground resize-none transition-colors ${
                  errors.bio ? 'border-destructive' : 'border-white/10 hover:border-white/20'
                }`}
              />
              <div className="flex justify-between items-center text-xs">
                {errors.bio ? (
                  <span className="text-destructive">{errors.bio}</span>
                ) : (
                  <span className="text-muted-foreground">Minimum 10 characters</span>
                )}
                <span className={`font-medium ${formData.bio.length > 500 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {formData.bio.length}/500
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-white">Your Location</h2>
              <p className="text-sm text-muted-foreground">
                Set your location to discover and connect with people nearby.
              </p>
            </div>

            <div className="pt-2">
              <ProfileGPSPicker
                label="Location Settings"
                value={formData.location}
                onChange={(location) => setFormData(prev => ({ ...prev, location }))}
                onSkip={handleSkipLocation}
                error={errors.location}
              />
            </div>
            
            {formData.location && !errors.location && (
              <div className="flex items-center justify-center p-4 bg-accent/10 border border-accent/20 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-accent mr-2" />
                <span className="text-sm font-medium text-accent">Location successfully set</span>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Interests */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-white">Interests</h2>
              <p className="text-sm text-muted-foreground">
                Select your interests to match with like-minded people.
              </p>
            </div>

            {errors.interests && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">{errors.interests}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Selected Interests */}
              {formData.interests.length > 0 && (
                <div className="flex flex-wrap gap-2 p-4 bg-white/5 border border-white/5 rounded-xl min-h-[4rem]">
                  {formData.interests.map((interest) => (
                    <span
                      key={interest}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          interests: prev.interests.filter(i => i !== interest)
                        }));
                      }}
                      className="inline-flex items-center px-3 py-1.5 bg-accent/10 text-accent border border-accent/20 text-sm font-medium rounded-full cursor-pointer hover:bg-accent hover:text-white transition-colors"
                    >
                      {interest}
                      <X className="w-3.5 h-3.5 ml-1.5" />
                    </span>
                  ))}
                </div>
              )}

              {/* Available Interests */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-foreground">Available Interests</span>
                  <span className="text-xs text-muted-foreground">{formData.interests.length}/10 selected</span>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-4 justify-center">
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
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-full hover:border-accent/40 hover:bg-accent/5 transition-colors text-sm font-medium text-foreground group shadow-sm hover:shadow-md"
                      >
                        <span>{option.label}</span>
                        <Plus className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Photos */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-white">Photos</h2>
              <p className="text-sm text-muted-foreground">
                Upload up to {PHOTO_LIMITS.MAX_PHOTOS} photos. The first photo will be your main profile picture.
              </p>
            </div>

            {errors.pictures && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">{errors.pictures}</p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Upload Button Component */}
              <label 
                htmlFor="photo-upload" 
                className={`aspect-square sm:aspect-[4/5] bg-white/5 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 hover:border-accent/50 transition-colors group ${formData.pictures.length >= PHOTO_LIMITS.MAX_PHOTOS ? 'hidden' : ''}`}
              >
                <div className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-white transition-colors">Add Photo</span>
                <input
                  type="file"
                  id="photo-upload"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Uploaded Photos */}
              {formData.pictures.map((file, index) => (
                <div key={index} className="aspect-square sm:aspect-[4/5] bg-[#0f1729] rounded-xl overflow-hidden relative group border border-white/5 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay controls */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {index === 0 && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-accent/90 backdrop-blur-md rounded-md">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">Main</span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => removePicture(index)}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-destructive/90 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-white">Review Profile</h2>
              <p className="text-sm text-muted-foreground">
                Almost done! Verify your details before we set up your profile.
              </p>
            </div>

            <div className="space-y-4">
              {/* Basic Info Summary */}
              <div className="bg-white/5 border border-white/5 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-sm font-medium text-white uppercase tracking-wider">Overview</h3>
                  <button onClick={() => setCurrentStep(1)} className="text-xs text-accent hover:text-accent/80 font-medium">Edit</button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm pt-1">
                  <div>
                    <span className="block text-muted-foreground mb-1 text-xs">Identifies as</span>
                    <span className="text-foreground font-medium capitalize">{formData.gender}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground mb-1 text-xs">Looking for</span>
                    <span className="text-foreground font-medium capitalize">{formData.sexualPreference}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="block text-muted-foreground mb-1 text-xs">Bio Summary</span>
                  <p className="text-sm text-foreground leading-relaxed line-clamp-3 bg-[#0f1729] rounded-lg p-3 border border-white/5">
                    {formData.bio}
                  </p>
                </div>
              </div>

              {/* Media Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/5 rounded-xl p-5 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-white">Interests ({formData.interests.length})</h3>
                    <button onClick={() => setCurrentStep(3)} className="text-xs text-accent hover:text-accent/80 font-medium">Edit</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {formData.interests.slice(0, 5).map((interest) => (
                      <span key={interest} className="px-2 py-1 bg-white/5 text-xs text-muted-foreground rounded-md border border-white/5">
                        {interest}
                      </span>
                    ))}
                    {formData.interests.length > 5 && (
                      <span className="px-2 py-1 bg-white/5 text-xs text-muted-foreground rounded-md border border-white/5">
                        +{formData.interests.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-xl p-5 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-white">Photos ({formData.pictures.length})</h3>
                    <button onClick={() => setCurrentStep(4)} className="text-xs text-accent hover:text-accent/80 font-medium">Edit</button>
                  </div>
                  <div className="flex gap-2">
                    {formData.pictures.slice(0, 3).map((file, idx) => (
                      <div key={idx} className="w-10 h-10 rounded-md overflow-hidden bg-[#0f1729] border border-white/10 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {formData.pictures.length > 3 && (
                      <div className="w-10 h-10 rounded-md bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium text-muted-foreground">+{formData.pictures.length - 3}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}