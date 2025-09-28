'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Save, Upload, X, ArrowLeft, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Spinner';
import { GENDER_OPTIONS, SEXUAL_PREFERENCE_OPTIONS, INTEREST_OPTIONS, PHOTO_LIMITS, ROUTES } from '@/lib/constants';
import toast from 'react-hot-toast';

interface EditFormData {
  gender: string;
  sexualPreference: string;
  bio: string;
  interests: string[];
}

export default function EditProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, loading, updateProfile, uploadPicture, deletePicture, addInterests, removeInterest } = useProfile();
  
  const [formData, setFormData] = useState<EditFormData>({
    gender: '',
    sexualPreference: '',
    bio: '',
    interests: [],
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [newPictures, setNewPictures] = useState<File[]>([]);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        gender: profile.gender || '',
        sexualPreference: profile.sexualPreference || '',
        bio: profile.bio || '',
        interests: profile.interests?.map(interest => interest.name) || [],
      });
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loading />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Profile Not Found
          </h1>
          <Button onClick={() => router.push(ROUTES.COMPLETE_PROFILE)}>
            Complete Profile
          </Button>
        </div>
      </div>
    );
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    } else if (formData.bio.trim().length < 10) {
      newErrors.bio = 'Bio must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles = Array.from(files).filter(file => {
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

    const totalPictures = (profile.pictures?.length || 0) + newPictures.length + validFiles.length;
    if (totalPictures > PHOTO_LIMITS.MAX_PHOTOS) {
      toast.error(`You can only have ${PHOTO_LIMITS.MAX_PHOTOS} photos maximum`);
      return;
    }

    setNewPictures(prev => [...prev, ...validFiles]);
  };

  // Remove new picture (not yet uploaded)
  const removeNewPicture = (index: number) => {
    setNewPictures(prev => prev.filter((_, i) => i !== index));
  };

  // Handle profile picture deletion
  const handleDeletePicture = async (pictureId: string) => {
    if (confirm('Are you sure you want to delete this photo?')) {
      await deletePicture(pictureId);
    }
  };

  // Handle interest removal
  const handleRemoveInterest = async (interestName: string) => {
    const interest = profile.interests?.find(i => i.name === interestName);
    if (interest) {
      const success = await removeInterest(interest.id.toString());
      if (success) {
        setFormData(prev => ({
          ...prev,
          interests: prev.interests.filter(name => name !== interestName)
        }));
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      // Update basic profile info
      const profileSuccess = await updateProfile({
        gender: formData.gender,
        sexualPreference: formData.sexualPreference,
        bio: formData.bio,
      });

      if (!profileSuccess) {
        throw new Error('Failed to update profile');
      }

      // Upload new pictures
      if (newPictures.length > 0) {
        const uploadPromises = newPictures.map(file => uploadPicture(file));
        const uploadResults = await Promise.all(uploadPromises);
        
        if (uploadResults.some(result => !result)) {
          throw new Error('Failed to upload some pictures');
        }
        
        setNewPictures([]);
      }

      // Add new interests
      const currentInterestNames = profile.interests?.map(i => i.name) || [];
      const newInterests = formData.interests.filter(interest => !currentInterestNames.includes(interest));
      
      if (newInterests.length > 0) {
        const interestsSuccess = await addInterests(newInterests);
        if (!interestsSuccess) {
          throw new Error('Failed to add interests');
        }
      }

      toast.success('Profile updated successfully!');
      router.push(ROUTES.PROFILE);
      
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                {/* Mobile Layout */}
                <div className="block lg:hidden">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(ROUTES.PROFILE)}
                      className="text-white hover:bg-white/20 flex items-center gap-2 px-2 py-1 rounded-lg transition-all duration-200"
                    >
                      <ArrowLeft size={16} />
                      <span className="text-sm font-medium">Back</span>
                    </Button>
                    <div className="text-center">
                      <h1 className="text-lg font-bold">Edit Profile</h1>
                    </div>
                    <div className="w-16"></div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:block">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(ROUTES.PROFILE)}
                      className="text-white hover:bg-white/20 flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200"
                    >
                      <ArrowLeft size={16} />
                      <span className="font-medium">Back to Profile</span>
                    </Button>
                    <h1 className="text-xl font-bold">Edit Your Profile</h1>
                    <div className="w-32"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div>
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 sm:space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Select
                      label="Gender"
                      options={GENDER_OPTIONS}
                      value={formData.gender}
                      onChange={(value) => setFormData(prev => ({ ...prev, gender: value as string }))}
                      placeholder="Select your gender"
                    />

                    <Select
                      label="Sexual Preference"
                      options={SEXUAL_PREFERENCE_OPTIONS}
                      value={formData.sexualPreference}
                      onChange={(value) => setFormData(prev => ({ ...prev, sexualPreference: value as string }))}
                      placeholder="Who are you interested in?"
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
                </CardContent>
              </Card>
            </motion.div>

            {/* Photos Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    Photos Gallery
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 sm:space-y-8">
                  {/* Current Photos */}
                  {profile.pictures && profile.pictures.length > 0 && (
                    <div>
                      <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        Your Photos
                        <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 rounded-full">
                          {profile.pictures?.length || 0}/{PHOTO_LIMITS.MAX_PHOTOS}
                        </span>
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {profile.pictures?.map((picture, index) => (
                          <div key={picture.id} className="relative group">
                            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-md group-hover:shadow-lg transition-shadow duration-200">
                              <img
                                src={`http://localhost:5000${picture.url}`}
                                alt={`Photo ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error('Image load error:', picture.url);
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-xl flex items-center justify-center">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeletePicture(picture.id)}
                                className="flex items-center gap-2 shadow-lg"
                              >
                                <Trash2 size={14} />
                                Delete
                              </Button>
                            </div>
                            {picture.isProfilePic && (
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

                  {/* New Photos Preview */}
                  {newPictures.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        New Photos (will be uploaded on save)
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {newPictures.map((file, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`New photo ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeNewPicture(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload New Photos */}
                  {((profile.pictures?.length || 0) + newPictures.length) < PHOTO_LIMITS.MAX_PHOTOS && (
                    <div className="border-2 border-dashed border-orange-200 rounded-lg p-6 text-center bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 transition-colors duration-200">
                      <input
                        type="file"
                        multiple
                        accept={PHOTO_LIMITS.ALLOWED_TYPES.join(',')}
                        onChange={handleFileUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="cursor-pointer flex flex-col items-center group"
                      >
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                          <Upload className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          Upload More Photos
                        </p>
                        <p className="text-xs text-gray-500">
                          Add up to {PHOTO_LIMITS.MAX_PHOTOS - ((profile.pictures?.length || 0) + newPictures.length)} more • Max 5MB each
                        </p>
                      </label>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Interests Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    Interests
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 sm:space-y-8">
                  {/* Current Interests */}
                  {formData.interests.length > 0 && (
                    <div>
                      <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        Your Interests
                        <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 rounded-full">
                          {formData.interests.length}
                        </span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {formData.interests.map((interestName) => (
                          <Badge
                            key={interestName}
                            className="flex items-center gap-1 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200 hover:from-orange-200 hover:to-amber-200 transition-colors"
                          >
                            {interestName}
                            <button
                              type="button"
                              onClick={() => handleRemoveInterest(interestName)}
                              className="hover:bg-red-200 rounded-full p-1 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add New Interests */}
                  <div>
                    <Select
                      label="Add New Interests"
                      options={INTEREST_OPTIONS.filter(option => !formData.interests.includes(option.label))}
                      value={[]}
                      onChange={(value) => {
                        const newInterests = value as string[];
                        const interestLabels = newInterests.map(val => {
                          const option = INTEREST_OPTIONS.find(opt => opt.value === val);
                          return option?.label || val;
                        });
                        setFormData(prev => ({
                          ...prev,
                          interests: [...prev.interests, ...interestLabels]
                        }));
                      }}
                      placeholder="Search and select interests..."
                      searchable
                      multiSelect
                      maxHeight={300}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center sm:justify-end gap-4 pt-6"
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="w-full sm:w-auto px-8 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-xl transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:via-amber-600 hover:to-orange-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </div>
  );
}
