'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, MapPin, Heart, Calendar, User, Camera, 
  Shield, Ban, Clock, MessageCircle, HeartHandshake, AlertTriangle,
  ChevronLeft, ChevronRight, X, Award
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useProfilePicture } from '@/hooks/useProfilePicture';
import { Button } from '@/components/ui/Button';
import { GENDER_OPTIONS, SEXUAL_PREFERENCE_OPTIONS, STATIC_BASE_URL } from '../../../../lib/constants';
import { profileApi } from '@/lib/profileApi';
import { useChatUnread } from '@/hooks/useChatUnread';
import { MatchModal } from '@/components/ui/MatchModal';
import { getLastSeenText } from '@/lib/utils';
import { PublicProfile } from '@/types';

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { profilePicture: currentUserPicture } = useProfilePicture();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const { refreshCount: refreshChatUnread } = useChatUnread();
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [hasLikedMe, setHasLikedMe] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Information');
  
  const username = params.username as string;
  const isOwnProfile = user?.username === username;

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await profileApi.getPublicProfile(username);
      if (response.success && response.data) {
        const profileData = response.data.profile;
        setProfile(profileData);
        
        setIsLiked(profileData.isLiked || false);
        setHasLikedMe(profileData.hasLikedMe || false);
        setIsConnected(profileData.isConnected || false);
        setIsOnline(profileData.isOnline || false);
        
      } else {
        if (response.message?.includes('blocked') || response.message?.includes('access denied')) {
          setError('This profile has been blocked and is no longer accessible.');
        } else {
          setError(response.message || 'Failed to load profile');
        }
      }
    } catch (error) {
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    if (isOwnProfile) {
      router.push('/profile');
      return;
    }
    fetchProfile();
  }, [username, isOwnProfile, router, fetchProfile]);

  const handleLike = async () => {
    if (!profile) return;

    if (!user?.isProfileCompleted) {
      toast.error('You need to complete your profile with a profile picture to like other users.');
      return;
    }

    try {
      setActionLoading('like');
      
      if (isLiked) {
        const response = await profileApi.unlikeUser(profile.userId);
        if (response.success) {
          setIsLiked(false);
          setIsConnected(false);
          toast.success(`You've unliked ${profile.firstName}'s profile.`);
        } else {
          toast.error(response.message || 'Failed to unlike user');
        }
      } else {
        const response = await profileApi.likeUser(profile.userId);
        if (response.success) {
          setIsLiked(true);
          if (hasLikedMe) {
            setIsConnected(true);
            setShowMatchModal(true);
          } else {
            toast.success(`❤️ You liked ${profile.firstName}'s profile!`);
          }
        } else {
          toast.error(response.message || 'Failed to like user');
        }
      }
    } catch (error) {
      toast.error('An error occurred while processing your request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlock = async () => {
    if (!profile) return;
    setShowBlockModal(true);
  };

  const confirmBlock = async () => {
    if (!profile) return;
    
    try {
      setActionLoading('block');
      setShowBlockModal(false);
      const response = await profileApi.blockUser(profile.userId);
      if (response.success) {
        setIsLiked(false);
        setIsConnected(false);
        toast.success(`${profile.firstName} has been blocked successfully.`);
        // Refresh chat unread badge to reflect cleared messages from this user
        refreshChatUnread().catch(() => {
          // ignore
        });
        router.push('/browse');
      } else {
        toast.error(response.message || 'Failed to block user');
      }
    } catch (error) {
      toast.error('An error occurred while blocking user');
    } finally {
      setActionLoading(null);
    }
  };


  const handleReport = async () => {
    if (!user || !profile || !reportReason.trim() || reportReason.trim().length < 10) return;

    try {
      setActionLoading('report');
      const response = await profileApi.reportUser(profile.userId, reportReason.trim());
      if (response.success) {
        setShowReportModal(false);
        setReportReason('');
        toast.success(`${profile.firstName} has been reported. Thank you for keeping our community safe.`);
      } else {
        toast.error(response.message || 'Failed to report user');
      }
    } catch (error) {
      toast.error('Failed to report user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartChat = () => {
    if (isConnected) {
      router.push(`/chat?user=${profile?.username}`);
    } else {
      router.push('/messages'); 
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
    if (rating >= 500) return { level: 'Diamond', color: 'text-sky-400', bgColor: 'bg-sky-100' };
    if (rating >= 300) return { level: 'Platinum', color: 'text-purple-400', bgColor: 'bg-purple-100' };
    if (rating >= 150) return { level: 'Gold', color: 'text-yellow-500', bgColor: 'bg-yellow-100' };
    if (rating >= 50) return { level: 'Silver', color: 'text-slate-300', bgColor: 'bg-gray-50' };
    return { level: 'Bronze', color: 'text-amber-700', bgColor: 'bg-amber-50' };
  };

  const genderLabel = GENDER_OPTIONS.find(g => g.value === profile?.gender)?.label;
  const preferenceLabel = SEXUAL_PREFERENCE_OPTIONS.find(p => p.value === profile?.sexualPreference)?.label;
  
  // Loading state - show while fetching profile
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-slate-300 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Loading Profile...</h2>
          <p className="text-muted-foreground">Please wait while we fetch the profile details</p>
        </div>
      </div>
    );
  }
  
  // Error state - show only after loading is complete and there's an error
  if (error || !profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center bg-card border-2 border-border rounded-xl p-8">
          <User size={64} className="mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {error || 'Profile Not Found'}
          </h1>
          <p className="text-muted-foreground mb-6">
            This profile doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={() => router.push('/browse')} className="bg-accent hover:bg-primary-600">
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
    <div className="py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={20} />
        Back
      </Button>



      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mb-8"
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800/80 via-slate-700/60 to-slate-800/80 rounded-2xl"></div>

        <div className="relative p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            
            {/* Profile Picture */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative cursor-pointer"
              onClick={() => profile.pictures.length > 0 && setShowImageModal(true)}
            >
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-border/50 shadow-2xl bg-muted">
                {profilePicture ? (
                  <Image
                    src={profilePicture}
                    alt={`${profile.firstName}'s profile`}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    unoptimized
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <User size={48} className="text-muted-foreground" />
                  </div>
                )}
              </div>
              {/* Online Status */}
              <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-card shadow-lg ${
                isOnline ? 'bg-green-500' : 'bg-muted'
              }`}></div>
              {profile.pictures.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
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
              <div className="text-muted-foreground font-medium text-sm md:text-base mb-1">
                @{profile.username}
              </div>
              
              {/* Full Name & Age */}
              <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">
                {profile.firstName} {profile.lastName}
                {age && <span className="text-xl md:text-2xl text-muted-foreground ml-2">{age}</span>}
              </h1>
              
              {/* Status & Location */}
              <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{getLastSeenText(profile.lastSeen || null, isOnline)}</span>
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
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6 max-w-2xl">
                  {profile.bio}
                </p>
              )}

              {/* Connection Status Indicator */}
              {(isConnected || hasLikedMe || isLiked) && (
                <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                  {isConnected && (
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-full text-xs font-medium flex items-center gap-1">
                      <HeartHandshake size={12} />
                      Connected
                    </span>
                  )}
                  {hasLikedMe && !isConnected && (
                    <span className="px-3 py-1 bg-pink-500/20 text-pink-400 border border-pink-500/30 rounded-full text-xs font-medium flex items-center gap-1">
                      <Heart size={12} className="fill-current" />
                      Liked you
                    </span>
                  )}
                  {isLiked && (
                    <span className="px-3 py-1 bg-slate-600/40 text-slate-300 border border-slate-500/50 rounded-full text-xs font-medium flex items-center gap-1">
                      <Heart size={12} className="fill-current" />
                      You liked
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Button
                  onClick={handleLike}
                  disabled={actionLoading === 'like'}
                  className={`px-6 py-2.5 rounded-full shadow-lg flex items-center justify-center gap-2 font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 ${
                    isLiked
                      ? 'bg-destructive hover:bg-red-600 text-white'
                      : 'bg-accent hover:bg-primary-600 text-white'
                  }`}
                >
                  {actionLoading === 'like' ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{isLiked ? 'Unliking...' : 'Liking...'}</span>
                    </div>
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
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-full flex items-center justify-center gap-2 font-semibold transition-all duration-300 hover:scale-105"
                  >
                    <MessageCircle size={18} />
                    Chat
                  </Button>
                )}

                <Button
                  onClick={handleBlock}
                  disabled={actionLoading === 'block'}
                  variant="outline"
                  className="bg-destructive/20 border-2 border-destructive/50 text-destructive hover:bg-destructive/30 hover:border-destructive px-6 py-2.5 rounded-full flex items-center justify-center gap-2 font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {actionLoading === 'block' ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin"></div>
                      <span>Blocking...</span>
                    </div>
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
                  className="bg-card border-2 border-border text-foreground hover:bg-muted hover:border-accent hover:text-accent px-6 py-2.5 rounded-full flex items-center justify-center gap-2 font-semibold transition-all duration-300 hover:scale-105"
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
              <div className="bg-card border border-border rounded-xl p-4 min-w-[120px]">
                <div className="text-2xl font-bold text-foreground">{profile.fameRating}</div>
                <div className="text-xs text-muted-foreground font-medium">Fame</div>
                <div className={`text-xs font-medium ${fameInfo.color}`}>{fameInfo.level}</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="text-2xl font-bold text-foreground">{profile.pictures.length}</div>
                <div className="text-xs text-muted-foreground font-medium">Photos</div>
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
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-foreground">{profile.fameRating}</div>
              <div className="text-xs text-muted-foreground font-medium">Fame (<span className={fameInfo.color}>{fameInfo.level}</span>)</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-foreground">{profile.pictures.length}</div>
              <div className="text-xs text-muted-foreground font-medium">Photos</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-8"
      >
        <div className="border-b border-border">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 overflow-x-auto">
            {['Information', 'Gallery'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-accent/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          {/* Mobile Tab Navigation */}
          <div className="md:hidden mb-4">
            <div className="flex flex-wrap gap-2">
              {['Information', 'Gallery'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-slate-600 hover:bg-slate-500 text-white shadow-md'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <span className="whitespace-nowrap">{tab}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content Sections */}
      <div className="space-y-12">
        
        {/* Information Section */}
        {activeTab === 'Information' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            id="information"
          >
            <h2 className="text-2xl font-bold text-foreground mb-8">Information</h2>
            
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-1">
              {/* Left Column */}
              <div className="space-y-1">
                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-muted-foreground" />
                    <dt className="text-muted-foreground font-medium">Full Name</dt>
                  </div>
                  <dd className="text-foreground font-medium">{profile.firstName} {profile.lastName}</dd>
                </div>
                
                {genderLabel && (
                  <div className="flex items-center justify-between py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <User size={16} className="text-muted-foreground" />
                      <dt className="text-muted-foreground font-medium">Gender</dt>
                    </div>
                    <dd className="text-foreground font-medium">{genderLabel}</dd>
                  </div>
                )}
                
                {age && (
                  <div className="flex items-center justify-between py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-muted-foreground" />
                      <dt className="text-muted-foreground font-medium">Age</dt>
                    </div>
                    <dd className="text-foreground font-medium">{age} years old</dd>
                  </div>
                )}
                
                {profile.neighborhood && (
                  <div className="flex items-center justify-between py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-muted-foreground" />
                      <dt className="text-muted-foreground font-medium">Location</dt>
                    </div>
                    <dd className="text-foreground font-medium">{profile.neighborhood}</dd>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-1">
                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Award size={16} className="text-muted-foreground" />
                    <dt className="text-muted-foreground font-medium">Fame Rating</dt>
                  </div>
                  <div className="text-right">
                    <div className="text-foreground font-medium">{profile.fameRating}</div>
                    <div className={`text-xs font-medium ${fameInfo.color}`}>{fameInfo.level}</div>
                  </div>
                </div>
                
                {preferenceLabel && (
                  <div className="flex items-center justify-between py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <Heart size={16} className="text-muted-foreground" />
                      <dt className="text-muted-foreground font-medium">Looking for</dt>
                    </div>
                    <dd className="text-foreground font-medium">{preferenceLabel}</dd>
                  </div>
                )}
                
                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Camera size={16} className="text-muted-foreground" />
                    <dt className="text-muted-foreground font-medium">Photos</dt>
                  </div>
                  <dd className="text-foreground font-medium">{profile.pictures.length}</dd>
                </div>
                
                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-muted-foreground" />
                    <dt className="text-muted-foreground font-medium">Status</dt>
                  </div>
                  <dd className={`font-medium ${isOnline ? 'text-green-500' : 'text-muted-foreground'}`}>
                    {getLastSeenText(profile.lastSeen || null, isOnline)}
                  </dd>
                </div>
              </div>
            </div>

            {/* Interests Tags */}
            {profile.interests.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-bold text-foreground mb-6">Interests</h3>
                <div className="flex flex-wrap gap-3">
                  {profile.interests.map((interest) => (
                    <span
                      key={interest.id}
                      className="px-4 py-2 bg-card border border-border text-foreground rounded-lg hover:bg-muted transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      {interest.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Gallery Section */}
        {activeTab === 'Gallery' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            id="gallery"
          >
            <h2 className="text-2xl font-bold text-foreground mb-8">Gallery</h2>
            
            {profile.pictures.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {profile.pictures.map((picture, index) => (
                  <div key={picture.id} className="relative">
                    <motion.div
                      className="aspect-[3/4] rounded-lg overflow-hidden border-2 border-border hover:border-accent transition-colors cursor-pointer"
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
                        <span className="px-2 py-1 bg-accent text-white text-xs rounded shadow-md">
                          Main
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card border-2 border-border rounded-xl">
                <Camera size={64} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No photos uploaded</h3>
                <p className="text-muted-foreground">This user hasn&apos;t uploaded any photos yet</p>
              </div>
            )}
          </motion.div>
        )}
        
      </div>

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

      {/* Match Celebration Modal */}
      <MatchModal
        isOpen={showMatchModal}
        onClose={() => setShowMatchModal(false)}
        currentUserPicture={currentUserPicture ?? undefined}
        currentUserName={user?.firstName}
        matchedUserPicture={getProfilePicture() ?? undefined}
        matchedUserName={profile?.firstName}
        onStartChat={() => {
          setShowMatchModal(false);
          handleStartChat();
        }}
        onKeepBrowsing={() => setShowMatchModal(false)}
      />

      {/* Block Confirmation Modal */}
      <AnimatePresence>
        {showBlockModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowBlockModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card rounded-xl p-6 max-w-md w-full border-2 border-destructive/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <Ban className="text-destructive" size={24} />
                <h3 className="text-xl font-bold text-foreground">Block User</h3>
              </div>
              
              <p className="text-muted-foreground mb-6">
                Are you sure you want to block <span className="font-semibold text-foreground">{profile.firstName}</span>?
              </p>
              
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6">
                <p className="text-destructive text-sm font-medium mb-2">This will:</p>
                <ul className="text-destructive text-sm space-y-1">
                  <li>• Remove them from your search results</li>
                  <li>• Remove any existing likes or connections</li>
                  <li>• Disable chat between you</li>
                  <li>• Prevent them from seeing your profile</li>
                </ul>
                <p className="text-destructive text-xs mt-3 italic">
                  This action can be reversed by unblocking them later.
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowBlockModal(false)}
                  variant="outline"
                  className="flex-1 border-border"
                  disabled={actionLoading === 'block'}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmBlock}
                  disabled={actionLoading === 'block'}
                  className="flex-1 bg-destructive hover:bg-red-600 text-white disabled:opacity-50"
                >
                  {actionLoading === 'block' ? (
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Blocking...</span>
                    </div>
                  ) : (
                    'Block User'
                  )}
                </Button>
              </div>
            </motion.div>
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
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-destructive" size={24} />
                <h3 className="text-xl font-bold text-foreground">Report User</h3>
              </div>
              
              <p className="text-muted-foreground mb-6">
                Why are you reporting {profile.firstName}? This will help us keep our community safe.
              </p>
              
              {/* Common report reasons */}
              <div className="mb-4">
                <p className="text-sm font-medium text-foreground mb-3">Common reasons:</p>
                <div className="space-y-2">
                  {[
                    'Fake profile / Catfishing',
                    'Inappropriate photos',
                    'Harassment or inappropriate messages',
                    'Spam or promotional content',
                    'Under 18 years old',
                    'Other (please specify below)'
                  ].map((reason) => (
                    <button
                      key={reason}
                      onClick={() => setReportReason(reason)}
                      className={`w-full text-left p-2 text-sm rounded border transition-colors ${
                        reportReason === reason
                          ? 'bg-destructive/10 border-destructive text-destructive'
                          : 'bg-input border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
              
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Please provide additional details about why you're reporting this user..."
                className="w-full p-3 bg-input border border-border rounded-lg resize-none h-24 focus:ring-2 focus:ring-ring focus:border-transparent text-sm text-foreground placeholder-muted-foreground"
              />
              
              <div className="text-xs text-muted-foreground mt-2 mb-4">
                Minimum 10 characters required. Your report will be reviewed by our moderation team.
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportReason('');
                  }}
                  variant="outline"
                  className="flex-1 border-border"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReport}
                  disabled={!reportReason.trim() || reportReason.trim().length < 10 || actionLoading === 'report'}
                  className="flex-1 bg-destructive hover:bg-red-600 text-white"
                >
                  {actionLoading === 'report' ? (
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Reporting...</span>
                    </div>
                  ) : (
                    'Submit Report'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}