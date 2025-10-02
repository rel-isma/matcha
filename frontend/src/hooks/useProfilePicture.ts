'use client';

import { useState, useEffect } from 'react';
import { profileApi } from '@/lib/profileApi';

export const useProfilePicture = () => {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const result = await profileApi.getMyProfile();
        if (result.success && result.data?.pictures?.length > 0) {
          // Get the main profile picture (first one or the one marked as profile pic)
          const mainPicture = result.data.pictures.find(pic => pic.isProfilePic) || result.data.pictures[0];
          setProfilePicture(`http://localhost:5000${mainPicture.url}`);
        }
      } catch (error) {
        console.error('Failed to fetch profile picture:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfilePicture();
  }, []);

  return { profilePicture, loading };
};