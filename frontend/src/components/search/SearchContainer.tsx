'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { ProfileCardData, SearchFilters as SearchFiltersType } from '@/types';
import { SearchFilters } from './SearchFilters';
import { ProfileCard } from '../browse/ProfileCard';
import { Spinner } from '../ui/Spinner';
import { MatchModal } from '../ui/MatchModal';
import { useRouter } from 'next/navigation';
import { profileApi } from '@/lib/profileApi';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

export const SearchContainer: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { profile: currentUserProfile } = useProfile();
  const [profiles, setProfiles] = useState<ProfileCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [matchModalData, setMatchModalData] = useState<{
    isOpen: boolean;
    matchedProfile?: ProfileCardData;
  }>({ isOpen: false });
  const [filters, setFilters] = useState<SearchFiltersType>({
    sortBy: 'fame',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    hasMore: true
  });
  const [availableInterests, setAvailableInterests] = useState<string[]>([]);

  // Fetch profiles with search filters
  const searchProfiles = useCallback(async (searchFilters?: SearchFiltersType, page: number = 1, isAppend: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // Use provided filters or current filters
      const filtersToUse = searchFilters || filters;

      const result = await profileApi.searchProfiles({
        minAge: filtersToUse.minAge,
        maxAge: filtersToUse.maxAge,
        minFame: filtersToUse.minFame,
        maxFame: filtersToUse.maxFame,
        tags: filtersToUse.tags,
        city: filtersToUse.city,
        sortBy: filtersToUse.sortBy,
        sortOrder: filtersToUse.sortOrder,
        page,
        limit: pagination.limit,
      });

      if (!result.success) {
        throw new Error(result.message || 'Failed to search profiles');
      }

      if (isAppend) {
        setProfiles(prev => [...prev, ...result.data!.profiles]);
      } else {
        setProfiles(result.data!.profiles);
      }
      
      setPagination(prev => ({
        ...prev,
        page: result.data!.pagination.page,
        hasMore: result.data!.pagination.hasMore
      }));

      setHasSearched(true);

    } catch (error) {
      if (error instanceof Error && error.message === 'Profile not completed') {
        // Redirect to profile completion
        router.push('/complete-profile');
        return;
      }
      toast.error(error instanceof Error ? error.message : 'Failed to search profiles');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, pagination.limit, router]);

  // Fetch popular interests for filter suggestions
  useEffect(() => {
    const fetchInterests = async () => {
      try {
        // Common interests that match the backend
        const commonInterests = [
          'Travel', 'Music', 'Movies', 'Sports', 'Reading', 'Cooking', 'Photography',
          'Art', 'Gaming', 'Fitness', 'Dancing', 'Hiking', 'Technology', 'Fashion',
          'Nature', 'Yoga', 'Writing', 'Meditation', 'Wine', 'Coffee'
        ];
        setAvailableInterests(commonInterests);
      } catch {
        // ignore
      }
    };

    fetchInterests();
  }, []);

  // Handle filter changes
  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    
    // Only auto-search for sorting changes, not for filter changes
    if (hasSearched && (newFilters.sortBy !== filters.sortBy || newFilters.sortOrder !== filters.sortOrder)) {
      const hasOtherFilters = Boolean(
        newFilters.minAge || newFilters.maxAge || newFilters.minFame || 
        newFilters.maxFame || newFilters.city || newFilters.tags?.length
      );
      if (hasOtherFilters) {
        searchProfiles(newFilters, 1, false);
      }
    }
  };

  // Manual search trigger
  const handleSearch = (filtersToSearch: SearchFiltersType) => {
    searchProfiles(filtersToSearch, 1, false);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      sortBy: 'fame',
      sortOrder: 'desc'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    setProfiles([]);
    setHasSearched(false);
  };

  // Load more profiles
  const handleLoadMore = () => {
    if (!loadingMore && pagination.hasMore) {
      searchProfiles(filters, pagination.page + 1, true);
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

  const handleMatchModalKeepSearching = () => {
    setMatchModalData({ isOpen: false });
  };

  const hasActiveFilters = Boolean(
    filters.minAge || filters.maxAge || filters.minFame || 
    filters.maxFame || filters.city || filters.tags?.length
  );

  return (
    <div className="">
      <div className="py-4">
        {/* Filters */}
        <div className="mb-4">
          <SearchFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleResetFilters}
            onSearch={handleSearch}
            availableInterests={availableInterests}
          />
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        ) : !hasSearched ? (
          <div className="text-center py-16">
            <div className="flex items-center justify-center w-20 h-20 bg-card border border-border rounded-full mx-auto mb-6">
              <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Ready to Search</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Set your search criteria using the filters above, then click &quot;Apply Search&quot; to find profiles that match exactly what you&apos;re looking for.
            </p>
            
            <div className="bg-card border border-accent/30 rounded-lg p-4 max-w-md mx-auto mb-8">
              <div className="flex items-center gap-2 text-accent">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-sm">
                  Please set at least one filter to start searching
                </span>
              </div>
            </div>
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex items-center justify-center w-20 h-20 bg-card border border-border rounded-full mx-auto mb-6">
              <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.084-2.34" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">No matches found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Try adjusting your search criteria to find more profiles that match your preferences.
            </p>
            <button 
              onClick={handleResetFilters}
              className="bg-accent hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Results Summary */}
            <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-foreground">
                  <span className="font-semibold">{profiles.length}</span> profiles found
                  {hasActiveFilters && (
                    <span className="text-muted-foreground ml-2">
                      with {Object.keys(filters).filter(key => filters[key as keyof SearchFiltersType] !== undefined).length} filters applied
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {profiles.map((profile, index) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                  onViewProfile={handleViewProfile}
                  priority={index === 0}
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
          onClose={handleMatchModalKeepSearching}
          currentUserPicture={currentUserProfile?.pictures?.[0]?.url}
          currentUserName={user?.firstName}
          matchedUserPicture={matchModalData.matchedProfile.pictures?.[0]?.url}
          matchedUserName={matchModalData.matchedProfile.firstName}
          onStartChat={handleMatchModalSayHello}
          onKeepBrowsing={handleMatchModalKeepSearching}
        />
      )}
    </div>
  );
};