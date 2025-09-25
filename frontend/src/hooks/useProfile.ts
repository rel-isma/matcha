// Profile management hook
'use client';

import { useState, useEffect } from 'react';
import { profileApi } from '../lib/profileApi';
import type { ProfileWithDetails, UpdateProfileInput, ProfilePicture, Interest } from '../types';
import toast from 'react-hot-toast';

interface UseProfileReturn {
  profile: ProfileWithDetails | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: UpdateProfileInput) => Promise<boolean>;
  uploadPicture: (file: File) => Promise<boolean>;
  deletePicture: (pictureId: string) => Promise<boolean>;
  addInterests: (interests: string[]) => Promise<boolean>;
  removeInterest: (interestId: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  isProfileComplete: () => boolean;
}

export const useProfile = (): UseProfileReturn => {
  const [profile, setProfile] = useState<ProfileWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await profileApi.getMyProfile();
      
      if (result.success && result.data) {
        setProfile(result.data);
      } else {
        setError(result.message || 'Failed to fetch profile');
      }
    } catch (err) {
      setError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (data: UpdateProfileInput): Promise<boolean> => {
    try {
      const result = await profileApi.updateMyProfile(data);
      
      if (result.success && result.data) {
        setProfile(result.data);
        toast.success('Profile updated successfully');
        return true;
      } else {
        toast.error(result.message || 'Failed to update profile');
        return false;
      }
    } catch (err) {
      toast.error('Failed to update profile');
      return false;
    }
  };

  // Upload picture
  const uploadPicture = async (file: File): Promise<boolean> => {
    try {
      const result = await profileApi.uploadPicture(file);
      
      if (result.success) {
        // Refresh profile to get updated pictures
        await fetchProfile();
        toast.success('Picture uploaded successfully');
        return true;
      } else {
        toast.error(result.message || 'Failed to upload picture');
        return false;
      }
    } catch (err) {
      toast.error('Failed to upload picture');
      return false;
    }
  };

  // Delete picture
  const deletePicture = async (pictureId: string): Promise<boolean> => {
    try {
      const result = await profileApi.deletePicture(pictureId);
      
      if (result.success) {
        // Update profile state to remove the deleted picture
        if (profile) {
          setProfile({
            ...profile,
            pictures: profile.pictures.filter(pic => pic.id !== pictureId)
          });
        }
        toast.success('Picture deleted successfully');
        return true;
      } else {
        toast.error(result.message || 'Failed to delete picture');
        return false;
      }
    } catch (err) {
      toast.error('Failed to delete picture');
      return false;
    }
  };

  // Add interests
  const addInterests = async (interests: string[]): Promise<boolean> => {
    try {
      const result = await profileApi.addInterests(interests);
      
      if (result.success) {
        // Refresh profile to get updated interests
        await fetchProfile();
        toast.success('Interests added successfully');
        return true;
      } else {
        toast.error(result.message || 'Failed to add interests');
        return false;
      }
    } catch (err) {
      toast.error('Failed to add interests');
      return false;
    }
  };

  // Remove interest
  const removeInterest = async (interestId: string): Promise<boolean> => {
    try {
      const result = await profileApi.removeInterest(interestId);
      
      if (result.success) {
        // Update profile state to remove the interest
        if (profile) {
          setProfile({
            ...profile,
            interests: profile.interests.filter(interest => interest.id.toString() !== interestId)
          });
        }
        toast.success('Interest removed successfully');
        return true;
      } else {
        toast.error(result.message || 'Failed to remove interest');
        return false;
      }
    } catch (err) {
      toast.error('Failed to remove interest');
      return false;
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    await fetchProfile();
  };

  // Check if profile is complete
  const isProfileComplete = (): boolean => {
    if (!profile) return false;
    
    // Check required fields
    const hasGender = !!profile.gender;
    const hasSexualPreference = !!profile.sexualPreference;
    const hasBio = !!profile.bio && profile.bio.trim().length > 0;
    const hasAtLeastOnePicture = profile.pictures.length > 0;
    const hasInterests = profile.interests.length > 0;
    
    return hasGender && hasSexualPreference && hasBio && hasAtLeastOnePicture && hasInterests;
  };

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadPicture,
    deletePicture,
    addInterests,
    removeInterest,
    refreshProfile,
    isProfileComplete,
  };
};
