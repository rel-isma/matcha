'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, MapPin, Heart, Camera, Save, Eye, EyeOff, Upload, X, Trash2, Navigation } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { GENDER_OPTIONS, SEXUAL_PREFERENCE_OPTIONS, INTEREST_OPTIONS, PHOTO_LIMITS } from '@/lib/constants';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
}

interface ProfileFormData {
  gender: string;
  sexualPreference: string;
  bio: string;
  dateOfBirth: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface LocationFormData {
  neighborhood: string;
  latitude: number | null;
  longitude: number | null;
  locationSource: 'manual' | 'gps';
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { profile, updateProfile, uploadPicture, deletePicture, addInterests, removeInterest } = useProfile();
  const { coordinates, error: geoError, loading: geoLoading } = useGeolocation();
  
  const [activeTab, setActiveTab] = useState('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [newPictures, setNewPictures] = useState<File[]>([]);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Form data states
  const [userFormData, setUserFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: ''
  });

  const [profileFormData, setProfileFormData] = useState<ProfileFormData>({
    gender: '',
    sexualPreference: '',
    bio: '',
    dateOfBirth: ''
  });

  const [passwordFormData, setPasswordFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [locationFormData, setLocationFormData] = useState<LocationFormData>({
    neighborhood: '',
    latitude: null,
    longitude: null,
    locationSource: 'manual'
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Initialize form data when user/profile loads
  useEffect(() => {
    if (user) {
      setUserFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setProfileFormData({
        gender: profile.gender || '',
        sexualPreference: profile.sexualPreference || '',
        bio: profile.bio || '',
        dateOfBirth: profile.dateOfBirth || ''
      });

      setLocationFormData({
        neighborhood: profile.neighborhood || '',
        latitude: profile.latitude || null,
        longitude: profile.longitude || null,
        locationSource: profile.locationSource || 'manual'
      });
    }
  }, [profile]);

  const handleUserFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Call API to update user information
      const response = await authApi.updateUser(userFormData);
      
      if (response.success) {
        // Update auth context
        await updateUser();
        toast.success('Personal information updated successfully!');
      } else {
        setErrors({ user: response.message || 'Failed to update personal information' });
      }
    } catch (error) {
      setErrors({ user: 'An error occurred while updating personal information' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const result = await updateProfile(profileFormData);
      
      if (result.success) {
        toast.success('Profile information updated successfully!');
      } else {
        setErrors({ profile: result.message || 'Failed to update profile information' });
      }
    } catch (error) {
      setErrors({ profile: 'An error occurred while updating profile information' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validate passwords match
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setErrors({ password: 'New passwords do not match' });
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (passwordFormData.newPassword.length < 8) {
      setErrors({ password: 'New password must be at least 8 characters long' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.changePassword({
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword
      });
      
      if (response.success) {
        toast.success('Password updated successfully!');
        setPasswordFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setErrors({ password: response.message || 'Failed to update password' });
      }
    } catch (error) {
      setErrors({ password: 'An error occurred while updating password' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload for photos
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles = Array.from(files).filter((file) => {
      const f = file as File;
      // Check file type
      if (!PHOTO_LIMITS.ALLOWED_TYPES.includes(f.type as any)) {
        toast.error(`${f.name} is not a supported image format`);
        return false;
      }
      
      // Check file size
      if (f.size > PHOTO_LIMITS.MAX_FILE_SIZE) {
        toast.error(`${f.name} is too large. Maximum size is ${PHOTO_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB`);
        return false;
      }
      
      return true;
    }) as File[];

    // Check total number of photos
    const currentPhotoCount = (profile?.pictures?.length || 0) + newPictures.length;
    const remainingSlots = PHOTO_LIMITS.MAX_PHOTOS - currentPhotoCount;
    
    if (validFiles.length > remainingSlots) {
      toast.error(`You can only upload ${remainingSlots} more photo(s). Maximum is ${PHOTO_LIMITS.MAX_PHOTOS} photos total.`);
      return;
    }

    setNewPictures((prev: File[]) => [...prev, ...validFiles]);
    toast.success(`${validFiles.length} photo(s) ready to upload`);
  };

  // Remove new picture from preview
  const removeNewPicture = (index: number) => {
    setNewPictures((prev: File[]) => prev.filter((_: File, i: number) => i !== index));
  };

  // Handle delete existing picture
  const handleDeletePicture = async (pictureId: string) => {
    try {
      setIsLoading(true);
      const success = await deletePicture(pictureId);
      if (success) {
        toast.success('Photo deleted successfully!');
      } else {
        toast.error('Failed to delete photo');
      }
    } catch (error) {
      toast.error('An error occurred while deleting photo');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle upload new pictures
  const handleUploadNewPictures = async () => {
    if (newPictures.length === 0) return;

    try {
      setIsLoading(true);
      
      for (const file of newPictures) {
        const success = await uploadPicture(file);
        if (!success) {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }
      
      setNewPictures([]);
      toast.success(`${newPictures.length} photo(s) uploaded successfully!`);
    } catch (error) {
      toast.error('Failed to upload some photos');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle add interests
  const handleAddInterests = async (selectedInterests: string[]) => {
    if (selectedInterests.length === 0) return;

    try {
      setIsLoading(true);
      const interestNames = selectedInterests.map(val => {
        const option = INTEREST_OPTIONS.find(opt => opt.value === val);
        return option?.label || val;
      });
      
      const success = await addInterests(interestNames);
      if (success) {
        toast.success(`${interestNames.length} interest(s) added successfully!`);
      } else {
        toast.error('Failed to add interests');
      }
    } catch (error) {
      toast.error('An error occurred while adding interests');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle remove interest
  const handleRemoveInterest = async (interestId: string) => {
    try {
      setIsLoading(true);
      const success = await removeInterest(interestId);
      if (success) {
        toast.success('Interest removed successfully!');
      } else {
        toast.error('Failed to remove interest');
      }
    } catch (error) {
      toast.error('An error occurred while removing interest');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle location form submission
  const handleLocationFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationFormData) return;
    
    try {
      setIsLoading(true);
      setErrors({});

      const success = await updateProfile({
        neighborhood: locationFormData.neighborhood,
        latitude: locationFormData.latitude,
        longitude: locationFormData.longitude,
        locationSource: locationFormData.locationSource
      });

      if (success) {
        toast.success('Location updated successfully!');
      } else {
        toast.error('Failed to update location');
      }
    } catch (error) {
      toast.error('An error occurred while updating location');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle GPS location update
  const handleUseGPS = async () => {
    if (!coordinates) {
      toast.error('GPS location not available');
      return;
    }

    try {
      setIsLoading(true);
      
      // Use the reverse geocoding from LocationPicker component logic
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.latitude}&lon=${coordinates.longitude}&zoom=10&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }
      
      const data = await response.json();
      const address = data.address || {};
      const city = address.city || address.town || address.village || address.municipality;
      const state = address.state || address.region;
      const country = address.country;
      
      // Use just the city name for cleaner display
      let neighborhood = '';
      if (city) {
        neighborhood = city;
      } else if (state) {
        neighborhood = state;
      } else if (country) {
        neighborhood = country;
      } else {
        neighborhood = `Location (${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)})`;
      }

      setLocationFormData({
        neighborhood,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        locationSource: 'gps'
      });

      toast.success('GPS location detected successfully!');
    } catch (error) {
      toast.error('Failed to get location from GPS');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'profile', label: 'Profile Details', icon: Heart },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'photos', label: 'Photos Gallery', icon: Camera },
    { id: 'interests', label: 'Interests', icon: Heart },
    { id: 'security', label: 'Security', icon: Lock }
  ];

  return (
    <div className="py-4 md:py-6">
      {/* Modern Settings Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mb-8"
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 rounded-2xl opacity-10"></div>
        
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* Header Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-1"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Account Settings
                  </h1>
                  {user && (
                    <p className="text-sm md:text-base text-orange-600 font-medium">
                      Welcome back, {user.firstName}!
                    </p>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 text-sm md:text-base max-w-2xl">
                Manage your personal information, profile details, photos, and security preferences to keep your account up to date.
              </p>
            </motion.div>

            {/* Stats Cards - Desktop */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="hidden md:flex gap-4"
            >
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 text-center min-w-[100px] border border-orange-100">
                <div className="text-xl font-bold text-orange-600">
                  {profile?.completeness || 0}%
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  Complete
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 text-center min-w-[100px] border border-orange-100">
                <div className="text-xl font-bold text-orange-600">
                  {profile?.pictures?.length || 0}
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  Photos
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 text-center min-w-[100px] border border-orange-100">
                <div className="text-xl font-bold text-orange-600">
                  {profile?.interests?.length || 0}
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  Interests
                </div>
              </div>
            </motion.div>

            {/* Stats Cards - Mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="md:hidden grid grid-cols-3 gap-3"
            >
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-3 text-center border border-orange-100">
                <div className="text-lg font-bold text-orange-600">
                  {profile?.completeness || 0}%
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  Complete
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-3 text-center border border-orange-100">
                <div className="text-lg font-bold text-orange-600">
                  {profile?.pictures?.length || 0}
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  Photos
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-3 text-center border border-orange-100">
                <div className="text-lg font-bold text-orange-600">
                  {profile?.interests?.length || 0}
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  Interests
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-6"
          >
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Profile Completion</span>
              <span className="font-semibold">{profile?.completeness || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${profile?.completeness || 0}%` }}
              ></div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="border-b border-orange-200 mb-6">
        {/* Desktop Navigation */}
        <nav className="hidden md:flex -mb-px space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600 bg-orange-50/50'
                    : 'border-transparent text-gray-500 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50/30'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Mobile Tab Navigation */}
        <div className="md:hidden mb-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg transform scale-105'
                      : 'bg-white/70 backdrop-blur-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-orange-100'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        
        {/* Personal Information Tab */}
        {activeTab === 'personal' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-xl border-0 bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={20} />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUserFormSubmit} className="space-y-6">
                  {errors.user && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                      {errors.user}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <Input
                        type="text"
                        value={userFormData.firstName}
                        onChange={(e) => setUserFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <Input
                        type="text"
                        value={userFormData.lastName}
                        onChange={(e) => setUserFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={userFormData.email}
                      onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                      <Save size={16} />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Profile Details Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-xl border-0 bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart size={20} />
                  Profile Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileFormSubmit} className="space-y-6">
                  {errors.profile && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                      {errors.profile}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <Select
                        value={profileFormData.gender}
                        onChange={(e) => setProfileFormData(prev => ({ ...prev, gender: e.target.value }))}
                        options={[{ value: '', label: 'Select your gender' }, ...GENDER_OPTIONS]}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Looking For
                      </label>
                      <Select
                        value={profileFormData.sexualPreference}
                        onChange={(e) => setProfileFormData(prev => ({ ...prev, sexualPreference: e.target.value }))}
                        options={[{ value: '', label: 'Who are you looking for?' }, ...SEXUAL_PREFERENCE_OPTIONS]}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <Input
                      type="date"
                      value={profileFormData.dateOfBirth}
                      onChange={(e) => setProfileFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      min={new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString().split('T')[0]}
                      required
                    />
                    {profileFormData.dateOfBirth && (
                      <p className="text-sm text-gray-500 mt-1">
                        Age: {Math.floor((new Date().getTime() - new Date(profileFormData.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years old
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileFormData.bio}
                      onChange={(e) => setProfileFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell others about yourself..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                      rows={4}
                      maxLength={500}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {profileFormData.bio.length}/500 characters
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                      <Save size={16} />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Location Settings Tab */}
        {activeTab === 'location' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-xl border-0 bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin size={20} />
                  Location Settings
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Set your location using GPS or manually enter your city. This helps us find matches near you.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLocationFormSubmit} className="space-y-6">
                  {errors.location && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                      {errors.location}
                    </div>
                  )}
                  
                  {/* GPS Section */}
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Navigation size={20} className="text-orange-600" />
                      <h3 className="font-medium text-gray-900">GPS Location</h3>
                    </div>
                    
                    {geoLoading && (
                      <div className="text-sm text-gray-600 mb-3">
                        🔄 Getting your GPS location...
                      </div>
                    )}
                    
                    {geoError && (
                      <div className="text-sm text-red-600 mb-3">
                        ❌ GPS Error: {geoError}
                      </div>
                    )}
                    
                    {coordinates && (
                      <div className="text-sm text-green-600 mb-3">
                        ✅ GPS Location Available: {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        type="button"
                        onClick={handleUseGPS}
                        disabled={!coordinates || isLoading || geoLoading}
                        className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600"
                      >
                        <Navigation size={16} />
                        {geoLoading ? 'Getting GPS...' : coordinates ? 'Use GPS Location' : 'GPS Not Available'}
                      </Button>
                      
                      {coordinates && (
                        <div className="text-xs text-gray-500 flex items-center">
                          📍 Accuracy: ±50m
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Manual Location Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City / Location
                    </label>
                    <Input
                      type="text"
                      value={locationFormData?.neighborhood || ''}
                      onChange={(e) => setLocationFormData(prev => ({ 
                        ...prev,
                        neighborhood: e.target.value,
                        latitude: prev?.latitude || null,
                        longitude: prev?.longitude || null,
                        locationSource: prev?.locationSource || 'manual'
                      }))}
                      placeholder="Enter your city or neighborhood (e.g., New York, NY)"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Enter your city manually if you prefer not to use GPS
                    </p>
                  </div>
                  
                  {/* Current Location Info */}
                  {locationFormData?.neighborhood && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Current Location</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>📍 <strong>Location:</strong> {locationFormData.neighborhood}</div>
                        <div>📡 <strong>Source:</strong> {locationFormData?.locationSource === 'gps' ? 'GPS' : 'Manual'}</div>
                        {locationFormData?.latitude && locationFormData?.longitude && (
                          <div>🌍 <strong>Coordinates:</strong> {locationFormData.latitude.toFixed(4)}, {locationFormData.longitude.toFixed(4)}</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Location Source Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location Source
                    </label>
                    <Select
                      value={locationFormData?.locationSource || 'manual'}
                      onChange={(value) => setLocationFormData(prev => ({ 
                        ...prev, 
                        neighborhood: prev?.neighborhood || '',
                        latitude: prev?.latitude || null,
                        longitude: prev?.longitude || null,
                        locationSource: value as 'manual' | 'gps' 
                      }))}
                      options={[
                        { value: 'manual', label: 'Manual Entry' },
                        { value: 'gps', label: 'GPS Location' }
                      ]}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Choose how you want to set your location
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <Button
                      type="submit"
                      disabled={isLoading || !locationFormData.neighborhood}
                      className="w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                      <Save size={16} />
                      {isLoading ? 'Saving...' : 'Save Location'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-xl border-0 bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock size={20} />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordFormSubmit} className="space-y-6">
                  {errors.password && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                      {errors.password}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordFormData.currentPassword}
                        onChange={(e) => setPasswordFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter your current password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordFormData.newPassword}
                        onChange={(e) => setPasswordFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter your new password"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordFormData.confirmPassword}
                        onChange={(e) => setPasswordFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm your new password"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                      <Save size={16} />
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Photos Gallery Tab */}
        {activeTab === 'photos' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-xl border-0 bg-white/50 backdrop-blur-sm">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Camera size={24} />
                  Photos Gallery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 sm:space-y-8">
                {/* Current Photos */}
                {profile?.pictures && profile.pictures.length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      Your Photos
                      <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 rounded-full">
                        {profile.pictures?.length || 0}/{PHOTO_LIMITS.MAX_PHOTOS}
                      </span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
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
                      New Photos (ready to upload)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
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
                    <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
                      <Button
                        type="button"
                        onClick={handleUploadNewPictures}
                        disabled={isLoading}
                        className="w-full sm:w-auto flex items-center justify-center gap-2"
                      >
                        <Upload size={16} />
                        {isLoading ? 'Uploading...' : `Upload ${newPictures.length} Photo(s)`}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Upload New Photos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add New Photos
                  </label>
                  <div className="mt-1 flex justify-center px-4 sm:px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-orange-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                      <div className="flex flex-col sm:flex-row text-sm text-gray-600">
                        <label
                          htmlFor="photo-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500"
                        >
                          <span>Upload photos</span>
                          <input
                            id="photo-upload"
                            name="photo-upload"
                            type="file"
                            multiple
                            accept="image/*"
                            className="sr-only"
                            onChange={handleFileUpload}
                          />
                        </label>
                        <p className="sm:pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, JPEG, WEBP up to {PHOTO_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB each
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Interests Tab */}
        {activeTab === 'interests' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-xl border-0 bg-white/50 backdrop-blur-sm">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent flex items-center gap-2">
                  <MapPin size={24} />
                  Interests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 sm:space-y-8">
                {/* Current Interests */}
                {profile?.interests && profile.interests.length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-700 mb-4">
                      Your Interests ({profile.interests.length})
                    </h3>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {profile.interests.map((interest) => (
                        <Badge
                          key={interest.id}
                          className="text-xs sm:text-sm bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-200 rounded-full px-3 sm:px-4 py-2 flex items-center gap-2 hover:from-orange-200 hover:to-amber-200 transition-all duration-200"
                        >
                          {interest.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveInterest(interest.id)}
                            className="ml-1 text-orange-600 hover:text-orange-800 transition-colors"
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
                    options={INTEREST_OPTIONS.filter(option => 
                      !profile?.interests?.some(interest => interest.name === option.label)
                    )}
                    value={[]}
                    onChange={(value) => {
                      const selectedInterests = Array.isArray(value) ? value : [value];
                      handleAddInterests(selectedInterests);
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
        )}
      </div>
    </div>
  );
}
