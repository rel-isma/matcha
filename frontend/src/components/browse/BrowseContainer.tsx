'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { ProfileCardData } from '@/types';
import { BrowseFilters, BrowseFiltersData } from './BrowseFilters';
import { ProfileCard } from './ProfileCard';
import { Spinner } from '../ui/Spinner';
import { MatchModal } from '../ui/MatchModal';
import { useRouter } from 'next/navigation';
import { profileApi } from '@/lib/profileApi';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

export const BrowseContainer: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { profile: currentUserProfile } = useProfile();
  const [profiles, setProfiles] = useState<ProfileCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [matchModalData, setMatchModalData] = useState<{
    isOpen: boolean;
    matchedProfile?: ProfileCardData;
  }>({ isOpen: false });
  const [filters, setFilters] = useState<BrowseFiltersData>({
    sortBy: 'common_tags',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    hasMore: true
  });
  const [availableInterests, setAvailableInterests] = useState<string[]>([]);

  // Fetch profiles
  const fetchProfiles = useCallback(async (page: number = 1, isAppend: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const result = await profileApi.browseProfiles({
        minAge: filters.minAge,
        maxAge: filters.maxAge,
        maxDistance: filters.maxDistance,
        fameMin: filters.fameMin,
        fameMax: filters.fameMax,
        interests: filters.interests,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        page,
        limit: pagination.limit,
      });

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch profiles');
      }

      if (isAppend) {
        setProfiles(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newProfiles = result.data!.profiles.filter(p => !existingIds.has(p.id));
          return [...prev, ...newProfiles];
        });
      } else {
        setProfiles(result.data!.profiles);
      }
      
      setPagination(prev => ({
        ...prev,
        page: result.data!.pagination.page,
        hasMore: result.data!.pagination.hasMore
      }));

    } catch (error) {
      console.error('Fetch profiles error:', error);
      if (error instanceof Error && error.message === 'Profile not completed') {
        // Redirect to profile completion
        router.push('/complete-profile');
        return;
      }
      toast.error(error instanceof Error ? error.message : 'Failed to load profiles');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, pagination.limit, router]);

  // Initial load
  useEffect(() => {
    fetchProfiles(1, false);
  }, [fetchProfiles]);

  // Fetch popular interests for filter suggestions
  useEffect(() => {
    const fetchInterests = async () => {
      try {
        // This would typically be a separate API endpoint
        // For now, we'll use some common interests
        const commonInterests = [
          'Travel', 'Music', 'Movies', 'Sports', 'Reading', 'Cooking', 'Photography',
          'Art', 'Gaming', 'Fitness', 'Dancing', 'Hiking', 'Technology', 'Fashion'
        ];
        setAvailableInterests(commonInterests);
      } catch (error) {
        console.error('Failed to fetch interests:', error);
      }
    };

    fetchInterests();
  }, []);

  // Handle filter changes
  const handleFiltersChange = (newFilters: BrowseFiltersData) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      sortBy: 'common_tags',
      sortOrder: 'desc'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Load more profiles
  const handleLoadMore = () => {
    if (!loadingMore && pagination.hasMore) {
      fetchProfiles(pagination.page + 1, true);
    }
  };

  // Like a user
  const handleLike = async (userId: string) => {
    try {
      const result = await profileApi.likeUser(userId);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to like user');
      }

      // Find the profile that was liked
      const likedProfile = profiles.find(profile => profile.userId === userId);

      // Update the profile in the list
      setProfiles(prev => prev.map(profile => 
        profile.userId === userId 
          ? { ...profile, isLiked: true }
          : profile
      ));

      // Check if it's a match from the message
      if (result.message?.includes('match') && likedProfile) {
        // Show match modal instead of toast
        setMatchModalData({
          isOpen: true,
          matchedProfile: likedProfile
        });
      } else {
        toast.success('Profile liked!');
      }

    } catch (error) {
      console.error('Like error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to like profile');
    }
  };

  // Unlike a user
  const handleUnlike = async (userId: string) => {
    try {
      const result = await profileApi.unlikeUser(userId);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to unlike user');
      }

      // Update the profile in the list
      setProfiles(prev => prev.map(profile => 
        profile.userId === userId 
          ? { ...profile, isLiked: false, hasLikedBack: false }
          : profile
      ));

      toast.success('Like removed');

    } catch (error) {
      console.error('Unlike error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to unlike profile');
    }
  };

  // View profile
  const handleViewProfile = (username: string) => {
    router.push(`/profile/${username}`);
  };

  // Handle match modal actions
  const handleMatchModalSayHello = () => {
    if (matchModalData.matchedProfile) {
      // Navigate to chat with the matched user
      router.push(`/chat?user=${matchModalData.matchedProfile.username}`);
    }
    setMatchModalData({ isOpen: false });
  };

  const handleMatchModalKeepBrowsing = () => {
    setMatchModalData({ isOpen: false });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="">
      <div className="py-6">

        {/* Filters */}
        <div className="mb-6">
          <BrowseFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleResetFilters}
            availableInterests={availableInterests}
          />
        </div>

        {/* Results */}
        {profiles.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex items-center justify-center w-20 h-20 bg-card border border-border rounded-full mx-auto mb-6">
              <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">No profiles found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Try adjusting your filters or check back later for new profiles that match your preferences.
            </p>
            <button 
              onClick={handleResetFilters}
              className="bg-accent hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Profile Grid - Responsive: Fewer columns for larger cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {profiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                  onViewProfile={handleViewProfile}
                />
              ))}
            </div>

            {/* Load More */}
            {pagination.hasMore && (
              <div className="text-center pt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="bg-accent hover:bg-primary-600 disabled:bg-muted text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading more...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Load More Profiles</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Match Modal */}
      {matchModalData.isOpen && matchModalData.matchedProfile && (
        <MatchModal
          isOpen={matchModalData.isOpen}
          onClose={handleMatchModalKeepBrowsing}
          currentUserPicture={currentUserProfile?.pictures?.[0]?.url}
          currentUserName={user?.firstName}
          matchedUserPicture={matchModalData.matchedProfile.pictures?.[0]?.url}
          matchedUserName={matchModalData.matchedProfile.firstName}
          onStartChat={handleMatchModalSayHello}
          onKeepBrowsing={handleMatchModalKeepBrowsing}
        />
      )}
    </div>
  );
};