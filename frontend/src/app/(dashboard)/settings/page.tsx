'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { User, Mail, Lock, MapPin, Heart, Camera, Save, Eye, EyeOff, Upload, X, Trash2, Ban } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { GPSLocationPicker } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { GENDER_OPTIONS, SEXUAL_PREFERENCE_OPTIONS, INTEREST_OPTIONS, PHOTO_LIMITS, STATIC_BASE_URL } from '@/lib/constants';
import { authApi } from '@/lib/api';
import { profileApi } from '@/lib/profileApi';
import toast from 'react-hot-toast';
import { useProfilePicture } from '@/hooks/useProfilePicture';
import { DateInput } from '@heroui/react';
import { parseDate } from '@internationalized/date';

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
  latitude: number | null;
  longitude: number | null;
  locationSource: 'gps';
  neighborhood: string;
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { profilePicture } = useProfilePicture();
  const { profile, updateProfile, uploadPicture, deletePicture, addInterests, removeInterest } = useProfile();
  
  const [activeTab, setActiveTab] = useState('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [newPictures, setNewPictures] = useState<File[]>([]);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);

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
    latitude: null,
    longitude: null,
    locationSource: 'gps',
    neighborhood: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [blockedUsers, setBlockedUsers] = useState<Array<{
    id: string;
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    blockedAt: Date;
  }>>([]);

  // Track original values to detect changes
  const [originalUserData, setOriginalUserData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [originalProfileData, setOriginalProfileData] = useState<ProfileFormData>({
    gender: '',
    sexualPreference: '',
    bio: '',
    dateOfBirth: ''
  });
  const [originalLocationData, setOriginalLocationData] = useState<LocationFormData>({
    latitude: null,
    longitude: null,
    locationSource: 'gps',
    neighborhood: ''
  });

  const formatDateForInput = (dateValue?: string) => {
    if (!dateValue) return '';
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString().split('T')[0];
  };

  // Initialize form data when user/profile loads
  useEffect(() => {
    if (user) {
      const userData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      };
      setUserFormData(userData);
      setOriginalUserData(userData);
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      const profileData = {
        gender: profile.gender || '',
        sexualPreference: profile.sexualPreference || '',
        bio: profile.bio || '',
        dateOfBirth: formatDateForInput(profile.dateOfBirth)
      };
      setProfileFormData(profileData);
      setOriginalProfileData(profileData);

      const locationData = {
        latitude: profile.latitude || null,
        longitude: profile.longitude || null,
        locationSource: 'gps' as const,
        neighborhood: profile.neighborhood || ''
      };
      setLocationFormData(locationData);
      setOriginalLocationData(locationData);
    }
  }, [profile]);

  // Helper functions to detect changes
  const hasUserDataChanged = () => {
    return JSON.stringify(userFormData) !== JSON.stringify(originalUserData);
  };

  const hasProfileDataChanged = () => {
    return JSON.stringify(profileFormData) !== JSON.stringify(originalProfileData);
  };

  const hasLocationDataChanged = () => {
    return JSON.stringify(locationFormData) !== JSON.stringify(originalLocationData);
  };

  const getChangedUserFields = () => {
    const changes: string[] = [];
    if (userFormData.firstName !== originalUserData.firstName) changes.push('first name');
    if (userFormData.lastName !== originalUserData.lastName) changes.push('last name');
    if (userFormData.email !== originalUserData.email) changes.push('email');
    return changes;
  };

  const getChangedProfileFields = () => {
    const changes: string[] = [];
    if (profileFormData.gender !== originalProfileData.gender) changes.push('gender');
    if (profileFormData.sexualPreference !== originalProfileData.sexualPreference) changes.push('preference');
    if (profileFormData.bio !== originalProfileData.bio) changes.push('bio');
    if (profileFormData.dateOfBirth !== originalProfileData.dateOfBirth) changes.push('date of birth');
    return changes;
  };

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Check if anything has changed
    const userChanged = hasUserDataChanged();
    const profileChanged = hasProfileDataChanged();
    
    if (!userChanged && !profileChanged) {
      toast('No changes detected', { icon: 'ℹ️' });
      setIsLoading(false);
      return;
    }

    // Validate required fields
    const validationErrors: {[key: string]: string} = {};
    
    if (!userFormData.firstName.trim()) {
      validationErrors.firstName = 'First name is required';
    }
    
    if (!userFormData.lastName.trim()) {
      validationErrors.lastName = 'Last name is required';
    }
    
    if (!userFormData.email.trim()) {
      validationErrors.email = 'Email is required';
    }
    
    // Only validate dateOfBirth if it's not already set in the profile
    if (!profile?.dateOfBirth && !profileFormData.dateOfBirth) {
      validationErrors.dateOfBirth = 'Date of birth is required';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const successMessages: string[] = [];
      
      // Update user information if changed
      if (userChanged) {
        const userResponse = await authApi.updateUser(userFormData);
        
        if (!userResponse.success) {
          setErrors({ personal: userResponse.message || 'Failed to update personal information' });
          setIsLoading(false);
          return;
        }
        
        const changedFields = getChangedUserFields();
        if (changedFields.length > 0) {
          successMessages.push(`Updated ${changedFields.join(', ')}`);
        }
        
        // Update original data
        setOriginalUserData({ ...userFormData });
        
        // Update auth context
        await updateUser();
      }

      // Update profile information if changed
      if (profileChanged) {
        const profileResponse = await updateProfile(profileFormData);
        console.log('Profile update response:', profileFormData);
        
        if (!profileResponse) {
          setErrors({ personal: 'Failed to update profile information' });
          setIsLoading(false);
          return;
        }
        
        const changedFields = getChangedProfileFields();
        if (changedFields.length > 0) {
          successMessages.push(`Updated ${changedFields.join(', ')}`);
        }
        
        // Update original data
        setOriginalProfileData({ ...profileFormData });
      }

      // Show success message
      if (successMessages.length > 0) {
        toast.success(successMessages.join(' and '));
      }
    } catch {
      setErrors({ personal: 'An error occurred while updating personal information' });
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
        toast.success('Interests added successfully!');
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
    
    // Check if location has changed
    if (!hasLocationDataChanged()) {
      toast('No changes detected', { icon: 'ℹ️' });
      return;
    }
    
    try {
      setIsLoading(true);
      setErrors({});

      const success = await updateProfile({
        neighborhood: locationFormData.neighborhood,
        latitude: locationFormData.latitude ?? undefined,
        longitude: locationFormData.longitude ?? undefined,
        locationSource: locationFormData.locationSource
      });

      if (success) {
        setOriginalLocationData({ ...locationFormData });
        toast.success('Location updated successfully!');
      } else {
        toast.error('Failed to update location');
      }
    } catch {
      toast.error('An error occurred while updating location');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch blocked users when blocked tab is active
  useEffect(() => {
    if (activeTab === 'blocked') {
      fetchBlockedUsers();
    }
  }, [activeTab]);

  const fetchBlockedUsers = async () => {
    try {
      setIsLoading(true);
      const response = await profileApi.getBlockedUsers();
      if (response.success && response.data) {
        setBlockedUsers(response.data);
      } else {
        toast.error('Failed to load blocked users');
      }
    } catch (error) {
      toast.error('An error occurred while loading blocked users');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle forgot password directly
  const handleForgotPassword = async () => {
    if (!userFormData.email) {
      toast.error('Email address is required');
      return;
    }

    setIsForgotPasswordLoading(true);

    try {
      const result = await authApi.forgotPassword(userFormData.email);
      
      if (result.success) {
        toast.success(`Password reset link sent to ${userFormData.email}`);
      } else {
        toast.error(result.message || 'Failed to send password reset email');
      }
    } catch {
      toast.error('An error occurred while sending the password reset email');
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  // Handle unblock user
  const handleUnblockUser = async (userId: string, name: string) => {
    try {
      setIsLoading(true);
      const response = await profileApi.unblockUser(userId);
      if (response.success) {
        // Remove user from blocked list
        setBlockedUsers(prev => prev.filter(user => user.userId !== userId));
        toast.success(`${name} has been unblocked successfully!`);
      } else {
        toast.error(response.message || 'Failed to unblock user');
      }
    } catch (error) {
      toast.error('An error occurred while unblocking user');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'photos', label: 'Photos Gallery', icon: Camera },
    { id: 'interests', label: 'Interests', icon: Heart },
    { id: 'blocked', label: 'Blocked Users', icon: Ban },
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
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800/80 via-slate-700/60 to-slate-800/80 rounded-2xl"></div>
        
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
                {/* i want here not icon user i want avatar {profilePicture} and use Image not img */}
                {profilePicture ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-border/50">
                    <Image
                      src={profilePicture || STATIC_BASE_URL + '/default-avatar.png'  }
                      alt="Profile Picture"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    Account Settings
                  </h1>
                  {user && (
                    <p className="text-sm md:text-base text-muted-foreground font-medium">
                      Welcome back, {user.firstName}!
                    </p>
                  )}
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
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
              <div className="bg-card border border-border rounded-xl p-4 text-center min-w-[100px]">
                <div className="text-xl font-bold text-foreground">
                  {profile?.completeness || 0}%
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Complete
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-4 text-center min-w-[100px]">
                <div className="text-xl font-bold text-foreground">
                  {profile?.pictures?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Photos
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-4 text-center min-w-[100px]">
                <div className="text-xl font-bold text-foreground">
                  {profile?.interests?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
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
              <div className="bg-card border border-border rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-foreground">
                  {profile?.completeness || 0}%
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Complete
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-foreground">
                  {profile?.pictures?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Photos
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-foreground">
                  {profile?.interests?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
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
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Profile Completion</span>
              <span className="font-semibold">{profile?.completeness || 0}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${profile?.completeness || 0}%` }}
              ></div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="border-b border-border mb-6">
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-accent/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
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
                      ? 'bg-slate-600 hover:bg-slate-500 text-white shadow-lg transform scale-105'
                      : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border'
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
            <Card className="shadow-xl border-2 border-border bg-card">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl font-bold text-accent flex items-center gap-2">
                  <User size={24} />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePersonalInfoSubmit} className="space-y-6">
                  {errors.personal && (
                    <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg">
                      {errors.personal}
                    </div>
                  )}
                  
                  {/* Basic Information Section */}
                  <section className="space-y-4 rounded-2xl border border-border/60 bg-muted/30 p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-semibold text-foreground">
                        Basic Information
                      </h3>
                      <span className="text-xs text-muted-foreground">Public identity</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
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
                        <label className="block text-sm font-medium text-foreground mb-2">
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
                      <label className="block text-sm font-medium text-foreground mb-2">
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
                  </section>

                  {/* Soft Divider */}
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border/60" />
                    <span className="text-xs text-muted-foreground">Profile details</span>
                    <div className="h-px flex-1 bg-border/60" />
                  </div>

                  {/* Profile Details Section */}
                  <section className="space-y-4 rounded-2xl border border-border/60 bg-muted/30 p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-semibold text-foreground">
                        Profile Details
                      </h3>
                      <span className="text-xs text-muted-foreground">Match preferences</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Gender
                        </label>
                        <Select
                          value={profileFormData.gender}
                          onChange={(value) => setProfileFormData(prev => ({ ...prev, gender: value as string }))}
                          options={[...GENDER_OPTIONS]}
                          placeholder="Select your gender"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Looking For
                        </label>
                        <Select
                          value={profileFormData.sexualPreference}
                          onChange={(value) => setProfileFormData(prev => ({ ...prev, sexualPreference: value as string }))}
                          options={[...SEXUAL_PREFERENCE_OPTIONS]}
                          placeholder="Who are you looking for?"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Date of Birth
                      </label>
                      <DateInput
                        aria-label="Date of birth"
                        value={profileFormData.dateOfBirth ? parseDate(profileFormData.dateOfBirth) : null}
                        onChange={(value) =>
                          setProfileFormData(prev => ({
                            ...prev,
                            dateOfBirth: value ? value.toString() : ''
                          }))
                        }
                        minValue={parseDate(new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString().split('T')[0])}
                        maxValue={parseDate(new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0])}
                        isInvalid={Boolean(errors.dateOfBirth)}
                        errorMessage={errors.dateOfBirth}
                        classNames={{
                          base: 'w-full',
                          inputWrapper: 'bg-input rounded-lg border border-border hover:border-accent/60 focus-within:border-accent',
                          input: 'text-foreground',
                          label: 'text-foreground',
                          segment: 'text-foreground',
                          selectorIcon: 'text-muted-foreground'
                        }}
                      />
                      {profileFormData.dateOfBirth && !errors.dateOfBirth && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Age: {Math.floor((new Date().getTime() - new Date(profileFormData.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years old
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Bio
                      </label>
                      <textarea
                        value={profileFormData.bio}
                        onChange={(e) => setProfileFormData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell others about yourself..."
                        className="w-full px-3 py-2 bg-input border border-border text-foreground placeholder-muted-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-colors resize-none"
                        rows={4}
                        maxLength={500}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        {profileFormData.bio.length}/500 characters
                      </p>
                    </div>
                  </section>
                  
                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <Button
                      type="submit"
                      disabled={isLoading || (!hasUserDataChanged() && !hasProfileDataChanged())}
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
            <Card className="shadow-xl border-2 border-border bg-card">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl font-bold text-accent flex items-center gap-2">
                  <MapPin size={24} />
                  Your GPS Location
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Update your location using GPS only. Precise GPS location helps us find the best matches in your area.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLocationFormSubmit} className="space-y-6">
                  {errors.location && (
                    <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg">
                      {errors.location}
                    </div>
                  )}
                  
                  {/* GPSLocationPicker Component */}
                  <GPSLocationPicker
                    label="Current Location"
                    value={{
                      latitude: locationFormData.latitude || undefined,
                      longitude: locationFormData.longitude || undefined,
                      locationSource: 'gps',
                      neighborhood: locationFormData.neighborhood
                    }}
                    onChange={(location) => {
                      setLocationFormData({
                        latitude: location.latitude || null,
                        longitude: location.longitude || null,
                        locationSource: 'gps',
                        neighborhood: location.neighborhood || ''
                      });
                    }}
                    error={errors.location}
                  />
                  
                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <Button
                      type="submit"
                      disabled={isLoading || !hasLocationDataChanged() || !locationFormData.neighborhood}
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
            className="space-y-6"
          >
            {/* Change Password Card */}
            <Card className="shadow-xl border-2 border-border bg-card">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl font-bold text-accent flex items-center gap-2">
                  <Lock size={24} />
                  Change Password
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Update your password to keep your account secure
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordFormSubmit} className="space-y-6">
                  {errors.password && (
                    <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg">
                      {errors.password}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
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
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
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
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
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
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
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

            {/* Password Recovery Card */}
            <Card className="shadow-xl border-2 border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent">
                  <Mail size={20} />
                  Password Recovery
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Forgot your password? Reset it using your email address
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-accent/20 border border-accent/30 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">
                      Reset Password via Email
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Click the button below to send a password reset link to <span className="font-medium text-accent">{userFormData.email}</span>. Check your email and follow the instructions to reset your password.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleForgotPassword}
                    disabled={isForgotPasswordLoading || !userFormData.email}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-card hover:bg-accent/10 border-accent/30 text-accent hover:text-accent disabled:opacity-50"
                  >
                    <Mail size={16} />
                    {isForgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </div>
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
            <Card className="shadow-xl border-2 border-border bg-card">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-xl sm:text-2xl font-bold text-accent flex items-center gap-2">
                  <Camera size={24} />
                  Photos Gallery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 sm:space-y-8">
                {/* Current Photos */}
                {profile?.pictures && profile.pictures.length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                      Your Photos
                      <span className="px-2 py-1 text-xs font-medium bg-accent/20 text-accent rounded-full">
                        {profile.pictures?.length || 0}/{PHOTO_LIMITS.MAX_PHOTOS}
                      </span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                      {profile.pictures?.map((picture, index) => (
                        <div key={picture.id} className="relative group">
                          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-md group-hover:shadow-lg transition-shadow duration-200">
                            <Image
                              src={picture.url.startsWith('http') ? picture.url : `${STATIC_BASE_URL}${picture.url}`}
                              alt={`Photo ${index + 1}`}
                              fill
                              className="object-cover"
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
                              <Badge className="text-xs bg-accent text-white border-0 shadow-md">
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
                    <h3 className="text-sm font-medium text-foreground mb-3">
                      New Photos (ready to upload)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                      {newPictures.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={URL.createObjectURL(file)}
                              alt={`New photo ${index + 1}`}
                              fill
                              className="object-cover"
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
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Add New Photos
                  </label>
                  <div className="mt-1 flex justify-center px-4 sm:px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-md hover:border-accent transition-colors bg-card">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
                      <div className="flex flex-col sm:flex-row text-sm text-muted-foreground">
                        <label
                          htmlFor="photo-upload"
                          className="relative cursor-pointer bg-card rounded-md font-medium text-accent hover:text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring"
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
                      <p className="text-xs text-muted-foreground">
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
            <Card className="shadow-xl border-2 border-border bg-card">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-xl sm:text-2xl font-bold text-accent flex items-center gap-2">
                  <MapPin size={24} />
                  Interests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 sm:space-y-8">
                {/* Current Interests */}
                {profile?.interests && profile.interests.length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-4">
                      Your Interests ({profile.interests.length})
                    </h3>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {profile.interests.map((interest) => (
                        <Badge
                          key={interest.id || interest.name}
                          className="text-xs sm:text-sm bg-accent/20 text-accent border border-accent rounded-full px-3 sm:px-4 py-2 flex items-center gap-2 hover:bg-accent/30 transition-all duration-200 cursor-pointer"
                          onClick={() => handleRemoveInterest(String(interest.id || interest.name))}
                        >
                          {interest.name}
                          <span className="ml-1 text-accent hover:text-primary-600 transition-colors">
                            <X size={12} />
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Interests to Add */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-4">Add New Interests</h3>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {INTEREST_OPTIONS.filter(option => {
                      // Only show interests not already in user's interests
                      return !profile?.interests?.some(interest => interest.name.toLowerCase() === option.label.toLowerCase());
                    }).map(option => (
                      <Badge
                        key={option.value}
                        className="text-xs sm:text-sm bg-accent/10 text-accent border border-accent/30 rounded-full px-3 sm:px-4 py-2 flex items-center gap-2 hover:bg-accent/30 transition-all duration-200 cursor-pointer"
                        onClick={() => handleAddInterests([option.value])}
                      >
                        {option.label}
                        <span className="ml-1 text-accent hover:text-primary-600 transition-colors">
                          +
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Blocked Users Tab */}
        {activeTab === 'blocked' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-xl border-2 border-border bg-card">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-xl sm:text-2xl font-bold text-accent flex items-center gap-2">
                  <Ban size={24} />
                  Blocked Users
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Manage users you have blocked. You can unblock them to allow interaction again.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading blocked users...</p>
                  </div>
                ) : blockedUsers.length === 0 ? (
                  <div className="text-center py-12 bg-card border-2 border-border rounded-xl">
                    <Ban size={48} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Blocked Users</h3>
                    <p className="text-muted-foreground">
                      You haven&apos;t blocked any users yet. Users you block will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-foreground">
                      Blocked Users ({blockedUsers.length})
                    </h3>
                    <div className="grid gap-3 sm:gap-4">
                      {blockedUsers.map((user) => (
                        <div
                          key={user.userId}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-card border border-border rounded-lg hover:border-accent/50 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Profile Picture */}
                            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0 border-2 border-border">
                              {user.profilePicture ? (
                                <Image
                                  src={user.profilePicture.startsWith('http') ? user.profilePicture : `${STATIC_BASE_URL}${user.profilePicture}`}
                                  alt={`${user.firstName}'s profile`}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    (e.currentTarget.parentNode as HTMLElement).innerHTML = `
                                      <div class="w-full h-full flex items-center justify-center bg-muted">
                                        <span class="text-muted-foreground font-medium text-sm">${user.firstName.charAt(0)}</span>
                                      </div>
                                    `;
                                  }}
                                />
                              ) : (
                                <span className="text-muted-foreground font-medium text-lg">
                                  {user.firstName.charAt(0)}
                                </span>
                              )}
                            </div>
                            
                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-foreground text-sm sm:text-base truncate">
                                {user.firstName} {user.lastName}
                              </h4>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">@{user.username}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Blocked on {new Date(user.blockedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {/* Unblock Button */}
                          <Button
                            type="button"
                            onClick={() => handleUnblockUser(user.userId, user.firstName)}
                            disabled={isLoading}
                            className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 shrink-0"
                          >
                            <X size={16} />
                            <span>Unblock</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
