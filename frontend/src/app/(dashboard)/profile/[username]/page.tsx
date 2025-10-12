'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Heart, Eye, Star, Calendar, User, Camera, 
  Shield, Ban, Clock, MessageCircle, HeartHandshake, AlertTriangle,
  ChevronLeft, ChevronRight, X, Check, Users, Award
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Spinner';
import { ROUTES, GENDER_OPTIONS, SEXUAL_PREFERENCE_OPTIONS, STATIC_BASE_URL } from '../../../../lib/constants';
import { profileApi } from '@/lib/profileApi';
import { PublicProfile } from '@/types';

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [hasLikedMe, setHasLikedMe] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const username = params.username as string;

  // Check if viewing own profile
  const isOwnProfile = user?.username === username;

  useEffect(() => {
    if (isOwnProfile) {
      router.push('/profile');
      return;
    }
    fetchProfile();
  }, [username, isOwnProfile]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await profileApi.getPublicProfile(username);
      if (response.success && response.data) {
        const profileData = response.data.profile;
        setProfile(profileData);
        
        // Set interaction status from backend
        setIsLiked(profileData.isLiked || false);
        setHasLikedMe(profileData.hasLikedMe || false);
        setIsConnected(profileData.isConnected || false);
        setIsBlocked(profileData.isBlocked || false);
        setIsOnline(profileData.isOnline || false);
        setLastSeen(profileData.lastSeen || null);
        
        // Record profile view is handled automatically by the backend
      } else {
        setError(response.message || 'Failed to load profile');
      }
    } catch (error) {
      setError('Failed to load profile');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!profile) return;

    // Check if current user has a profile picture
    // This would need to be implemented based on your user/profile state
    // For now, we'll assume they can like if they have a completed profile
    if (!user?.isProfileCompleted) {
      alert('You need to complete your profile with a profile picture to like other users.');
      return;
    }

    try {
      setActionLoading('like');
      
      if (isLiked) {
        // Unlike
        const response = await profileApi.unlikeUser(profile.userId);
        if (response.success) {
          setIsLiked(false);
          setIsConnected(false);
        } else {
          alert(response.message || 'Failed to unlike user');
        }
      } else {
        // Like
        const response = await profileApi.likeUser(profile.userId);
        if (response.success) {
          setIsLiked(true);
          // Check if it creates a match (they already liked us)
          if (hasLikedMe) {
            setIsConnected(true);
          }
        } else {
          alert(response.message || 'Failed to like user');
        }
      }
    } catch (error) {
      console.error('Error handling like:', error);
      alert('An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlock = async () => {
    if (!profile) return;

    const confirmed = window.confirm(`Are you sure you want to block ${profile.firstName}? This will prevent them from appearing in search results and disable chat between you.`);
    
    if (confirmed) {
      try {
        setActionLoading('block');
        const response = await profileApi.blockUser(profile.userId);
        if (response.success) {
          setIsBlocked(true);
          alert('User has been blocked successfully.');
          router.push('/browse');
        } else {
          alert(response.message || 'Failed to block user');
        }
      } catch (error) {
        console.error('Error blocking user:', error);
        alert('An error occurred while blocking user');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleReport = async () => {
    if (!profile || !reportReason.trim()) return;

    try {
      setActionLoading('report');
      const response = await profileApi.reportUser(profile.userId, reportReason);
      if (response.success) {
        alert('User has been reported successfully. Thank you for helping keep our community safe.');
        setShowReportModal(false);
        setReportReason('');
      } else {
        alert(response.message || 'Failed to report user');
      }
    } catch (error) {
      console.error('Error reporting user:', error);
      alert('An error occurred while reporting user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartChat = () => {
    if (isConnected) {
      router.push(`/chat?user=${profile?.username}`);
    }
  };

  const nextImage = () => {
    if (profile?.pictures.length) {
      setActiveImageIndex((prev) => (prev + 1) % profile.pictures.length);
    }
  };

  const prevImage = () => {
    if (profile?.pictures.length) {
      setActiveImageIndex((prev) => (prev - 1 + profile.pictures.length) % profile.pictures.length);
    }
  };

  const getProfilePicture = () => {
    const profilePic = profile?.pictures?.find(pic => pic.isProfilePic);
    if (profilePic) {
      return profilePic.url.startsWith('http') ? profilePic.url : `${STATIC_BASE_URL}${profilePic.url}`;
    }
    return null;
  };

  const getAge = () => {
    if (!profile?.dateOfBirth) return null;
    return Math.floor((new Date().getTime() - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const getFameLevel = (rating: number) => {
    if (rating >= 500) return { level: 'Diamond', color: 'text-purple-500', bgColor: 'bg-purple-100' };
    if (rating >= 300) return { level: 'Platinum', color: 'text-gray-500', bgColor: 'bg-gray-100' };
    if (rating >= 150) return { level: 'Gold', color: 'text-yellow-500', bgColor: 'bg-yellow-100' };
    if (rating >= 50) return { level: 'Silver', color: 'text-gray-400', bgColor: 'bg-gray-50' };
    return { level: 'Bronze', color: 'text-orange-400', bgColor: 'bg-orange-100' };
  };

  const getLastSeenText = () => {
    if (isOnline) return 'Online now';
    if (!lastSeen) return 'Last seen unknown';
    
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return lastSeenDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: lastSeenDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const genderLabel = GENDER_OPTIONS.find(g => g.value === profile?.gender)?.label;
  const preferenceLabel = SEXUAL_PREFERENCE_OPTIONS.find(p => p.value === profile?.sexualPreference)?.label;
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loading />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <User size={64} className="mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Profile Not Found'}
          </h1>
          <p className="text-gray-600 mb-6">
            This profile doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={() => router.push('/browse')}>
            Back to Browse
          </Button>
        </div>
      </div>
    );
  }

  const fameInfo = getFameLevel(profile.fameRating);
  const age = getAge();
  const profilePicture = getProfilePicture();

  return (
    <div className="py-8 max-w-4xl mx-auto">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800"
      >
        <ArrowLeft size={20} />
        Back
      </Button>

      {/* Connection Status Banner */}
      {(isConnected || hasLikedMe) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg ${
            isConnected 
              ? 'bg-gradient-to-r from-pink-100 to-red-100 border border-pink-200' 
              : 'bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {isConnected ? (
              <>
                <HeartHandshake className="text-pink-500" size={24} />
                <div>
                  <h3 className="font-semibold text-pink-700">You&apos;re Connected!</h3>
                  <p className="text-pink-600 text-sm">
                    You both liked each other. You can now start chatting!
                  </p>
                </div>
                <div className="ml-auto">
                  <Button
                    onClick={handleStartChat}
                    className="bg-pink-500 hover:bg-pink-600 text-white"
                  >
                    <MessageCircle size={16} className="mr-2" />
                    Start Chat
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Heart className="text-orange-500 fill-current" size={24} />
                <div>
                  <h3 className="font-semibold text-orange-700">They Liked You!</h3>
                  <p className="text-orange-600 text-sm">
                    {profile.firstName} has liked your profile. Like them back to connect!
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mb-8"
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 rounded-2xl opacity-10"></div>

        <div className="relative p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            
            {/* Profile Picture */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative cursor-pointer"
              onClick={() => profile.pictures.length > 0 && setShowImageModal(true)}
            >
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-orange-200 shadow-2xl bg-gradient-to-br from-orange-100 to-amber-50">
                {profilePicture ? (
                  <Image
                    src={profilePicture}
                    alt={`${profile.firstName}'s profile`}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <User size={48} className="text-orange-400" />
                  </div>
                )}
              </div>
              {/* Online Status */}
              <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white shadow-lg ${
                isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
              {profile.pictures.length > 1 && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                  {profile.pictures.length} photos
                </div>
              )}
            </motion.div>

            {/* Profile Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex-1 text-center md:text-left"
            >
              {/* Username */}
              <div className="text-orange-500 font-medium text-sm md:text-base mb-1">
                @{profile.username}
              </div>
              
              {/* Full Name & Age */}
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
                {profile.firstName} {profile.lastName}
                {age && <span className="text-xl md:text-2xl text-gray-600 ml-2">{age}</span>}
              </h1>
              
              {/* Status & Location */}
              <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{getLastSeenText()}</span>
                </div>
                {profile.neighborhood && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{profile.neighborhood}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-6 max-w-2xl">
                  {profile.bio}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Button
                  onClick={handleLike}
                  disabled={actionLoading === 'like'}
                  className={`px-6 py-2.5 rounded-full shadow-lg flex items-center justify-center gap-2 font-semibold transition-all duration-300 hover:scale-105 ${
                    isLiked
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white'
                      : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
                  }`}
                >
                  {actionLoading === 'like' ? (
                    <Loading />
                  ) : (
                    <>
                      <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                      {isLiked ? 'Unlike' : 'Like'}
                    </>
                  )}
                </Button>

                {isConnected && (
                  <Button
                    onClick={handleStartChat}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2.5 rounded-full flex items-center gap-2 font-semibold transition-all duration-300 hover:scale-105"
                  >
                    <MessageCircle size={18} />
                    Chat
                  </Button>
                )}

                <Button
                  onClick={handleBlock}
                  disabled={actionLoading === 'block'}
                  variant="outline"
                  className="border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 px-6 py-2.5 rounded-full flex items-center gap-2 font-semibold transition-all duration-300"
                >
                  {actionLoading === 'block' ? (
                    <Loading />
                  ) : (
                    <>
                      <Ban size={18} />
                      Block
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => setShowReportModal(true)}
                  variant="outline"
                  className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 px-6 py-2.5 rounded-full flex items-center gap-2 font-semibold transition-all duration-300"
                >
                  <Shield size={18} />
                  Report
                </Button>
              </div>
            </motion.div>

            {/* Profile Stats - Desktop */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="hidden md:flex flex-col gap-4 text-center"
            >
              <div className={`${fameInfo.bgColor} rounded-xl p-4 min-w-[120px]`}>
                <div className={`text-2xl font-bold ${fameInfo.color}`}>{profile.fameRating}</div>
                <div className="text-xs text-gray-600 font-medium">Fame Rating</div>
                <div className={`text-xs ${fameInfo.color} font-medium`}>{fameInfo.level}</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-orange-600">{profile.pictures.length}</div>
                <div className="text-xs text-gray-600 font-medium">Photos</div>
              </div>
            </motion.div>
          </div>

          {/* Profile Stats - Mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="md:hidden mt-6 grid grid-cols-2 gap-4"
          >
            <div className={`${fameInfo.bgColor} rounded-xl p-3 text-center`}>
              <div className={`text-xl font-bold ${fameInfo.color}`}>{profile.fameRating}</div>
              <div className="text-xs text-gray-600 font-medium">Fame ({fameInfo.level})</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-orange-600">{profile.pictures.length}</div>
              <div className="text-xs text-gray-600 font-medium">Photos</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Profile Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid md:grid-cols-2 gap-8 mb-8"
      >
        {/* Left Column - Personal Info */}
        <div className="bg-white rounded-xl border border-orange-200 p-6">
          <h3 className="text-xl font-bold text-orange-600 mb-6">Personal Information</h3>
          
          <div className="space-y-4">
            {genderLabel && (
              <div className="flex items-center justify-between py-3 border-b border-orange-100">
                <div className="flex items-center gap-3">
                  <User size={16} className="text-orange-500" />
                  <span className="text-gray-700 font-medium">Gender</span>
                </div>
                <span className="text-gray-800 font-medium">{genderLabel}</span>
              </div>
            )}
            
            {preferenceLabel && (
              <div className="flex items-center justify-between py-3 border-b border-orange-100">
                <div className="flex items-center gap-3">
                  <Heart size={16} className="text-orange-500" />
                  <span className="text-gray-700 font-medium">Looking for</span>
                </div>
                <span className="text-gray-800 font-medium">{preferenceLabel}</span>
              </div>
            )}
            
            {age && (
              <div className="flex items-center justify-between py-3 border-b border-orange-100">
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-orange-500" />
                  <span className="text-gray-700 font-medium">Age</span>
                </div>
                <span className="text-gray-800 font-medium">{age} years old</span>
              </div>
            )}
            
            {profile.neighborhood && (
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-orange-500" />
                  <span className="text-gray-700 font-medium">Location</span>
                </div>
                <span className="text-gray-800 font-medium">{profile.neighborhood}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Stats */}
        <div className="bg-white rounded-xl border border-orange-200 p-6">
          <h3 className="text-xl font-bold text-orange-600 mb-6">Profile Stats</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-orange-100">
              <div className="flex items-center gap-3">
                <Award size={16} className="text-orange-500" />
                <span className="text-gray-700 font-medium">Fame Rating</span>
              </div>
              <div className="text-right">
                <div className="text-gray-800 font-medium">{profile.fameRating}</div>
                <div className={`text-xs ${fameInfo.color} font-medium`}>{fameInfo.level}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-orange-100">
              <div className="flex items-center gap-3">
                <Camera size={16} className="text-orange-500" />
                <span className="text-gray-700 font-medium">Photos</span>
              </div>
              <span className="text-gray-800 font-medium">{profile.pictures.length}</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-orange-100">
              <div className="flex items-center gap-3">
                <Users size={16} className="text-orange-500" />
                <span className="text-gray-700 font-medium">Interests</span>
              </div>
              <span className="text-gray-800 font-medium">{profile.interests.length}</span>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-orange-500" />
                <span className="text-gray-700 font-medium">Status</span>
              </div>
              <span className={`font-medium ${isOnline ? 'text-green-600' : 'text-gray-600'}`}>
                {getLastSeenText()}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Interests */}
      {profile.interests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-xl border border-orange-200 p-6 mb-8"
        >
          <h3 className="text-xl font-bold text-orange-600 mb-6">Interests</h3>
          <div className="flex flex-wrap gap-3">
            {profile.interests.map((interest) => (
              <span
                key={interest.id}
                className="px-4 py-2 bg-orange-100 border border-orange-300 text-orange-700 rounded-lg"
              >
                {interest.name}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Photo Gallery */}
      {profile.pictures.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white rounded-xl border border-orange-200 p-6"
        >
          <h3 className="text-xl font-bold text-orange-600 mb-6">Photos</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {profile.pictures.map((picture, index) => (
              <div key={picture.id} className="relative">
                <motion.div
                  className="aspect-[3/4] rounded-lg overflow-hidden border border-orange-200 hover:border-orange-400 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => {
                    setActiveImageIndex(index);
                    setShowImageModal(true);
                  }}
                >
                  <Image
                    src={picture.url.startsWith('http') ? picture.url : `${STATIC_BASE_URL}${picture.url}`}
                    alt={`Photo ${index + 1}`}
                    width={400}
                    height={533}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </motion.div>
                {picture.isProfilePic && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded shadow-md">
                      Main
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && profile.pictures.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
            onClick={() => setShowImageModal(false)}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
              >
                <X size={32} />
              </button>

              {profile.pictures.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors"
                  >
                    <ChevronLeft size={48} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors"
                  >
                    <ChevronRight size={48} />
                  </button>
                </>
              )}

              <motion.div
                key={activeImageIndex}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={profile.pictures[activeImageIndex]?.url.startsWith('http') 
                    ? profile.pictures[activeImageIndex].url 
                    : `${STATIC_BASE_URL}${profile.pictures[activeImageIndex]?.url}`
                  }
                  alt={`Photo ${activeImageIndex + 1}`}
                  width={800}
                  height={1067}
                  className="max-w-full max-h-[90vh] object-contain"
                  unoptimized
                />
              </motion.div>

              {profile.pictures.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {profile.pictures.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => { e.stopPropagation(); setActiveImageIndex(index); }}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === activeImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-red-500" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Report User</h3>
              </div>
              
              <p className="text-gray-600 mb-4">
                Why are you reporting {profile.firstName}? This will help us keep our community safe.
              </p>
              
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Please describe the reason for reporting this user..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowReportModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReport}
                  disabled={!reportReason.trim() || actionLoading === 'report'}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  {actionLoading === 'report' ? <Loading /> : 'Report'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}