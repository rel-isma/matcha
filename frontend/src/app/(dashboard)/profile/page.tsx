'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Edit, MapPin, Heart, Eye, Star, Calendar, User, Camera, Share2, Mail, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useProfilePicture } from '@/hooks/useProfilePicture';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Spinner';
import { ROUTES, GENDER_OPTIONS, SEXUAL_PREFERENCE_OPTIONS, STATIC_BASE_URL } from '../../../lib/constants';
import { profileApi } from '@/lib/profileApi';
import { LikeWithUser } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { profile, loading, error } = useProfile();
  const { profilePicture } = useProfilePicture();
  const [activeTab, setActiveTab] = useState('Information');
  const [likesReceived, setLikesReceived] = useState<LikeWithUser[]>([]);
  const [likesLoading, setLikesLoading] = useState(false);

  // Fetch likes received when component mounts
  useEffect(() => {
    const fetchLikesReceived = async () => {
      setLikesLoading(true);
      try {
        const response = await profileApi.getLikesReceived();
        if (response.success && response.data) {
          setLikesReceived(response.data);
        }
        console.log('Likes received:', response);
      } catch (error) {
        console.error('Failed to fetch likes received:', error);
      } finally {
        setLikesLoading(false);
      }
    };

    fetchLikesReceived();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  console.log('Profile data:', profile);

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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error ? 'Error Loading Profile' : 'Profile Not Found'}
          </h1>
          {error && (
            <p className="text-red-600 mb-4">
              {error}
            </p>
          )}
          <Button onClick={() => router.push(ROUTES.COMPLETE_PROFILE)}>
            Complete Profile
          </Button>
        </div>
      </div>
    );
  }

  const genderLabel = GENDER_OPTIONS.find(g => g.value === profile.gender)?.label;
  const preferenceLabel = SEXUAL_PREFERENCE_OPTIONS.find(p => p.value === profile.sexualPreference)?.label;

  const getFameLevel = (rating: number) => {
    if (rating >= 500) return { level: 'Diamond', color: 'text-orange-400' };
    if (rating >= 300) return { level: 'Platinum', color: 'text-orange-300' };
    if (rating >= 150) return { level: 'Gold', color: 'text-amber-400' };
    if (rating >= 50) return { level: 'Silver', color: 'text-amber-300' };
    return { level: 'Bronze', color: 'text-orange-300' };
  };

  const fameInfo = getFameLevel(profile.fameRating);
  const tabs = ['Information', 'Gallery', 'Profile Views', 'Likes Received'];

  const scrollToSection = (sectionName: string) => {
    setActiveTab(sectionName);
  };

  return (
    <div className="py-8">
          
          {/* Modern Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative mb-8"
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 rounded-2xl opacity-10"></div>

            <div className="relative p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                
                {/* Profile Picture */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="relative"
                >
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-orange-200 shadow-2xl bg-gradient-to-br from-orange-100 to-amber-50">
                    {profilePicture ? (
                      <Image
                        src={profilePicture}
                        alt="Profile"
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                        unoptimized
                        onError={() => {
                          console.error('Profile picture load error:', profilePicture);
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <User size={48} className="text-orange-400" />
                      </div>
                    )}
                  </div>
                  {/* Online Status */}
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
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
                    @{user?.username}
                  </div>
                  
                  {/* Full Name */}
                  <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  
                  {/* Status & Location */}
                  <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Online</span>
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
                  <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-6 max-w-2xl">
                    {profile.bio || `Looking for meaningful connections and interesting conversations. Here to meet new people and see what happens! ✨`}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                    <Button
                      onClick={() => router.push('/settings')}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-2.5 rounded-full shadow-lg flex items-center justify-center gap-2 font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105"
                    >
                      <Edit size={18} />
                      Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: `${user?.firstName} ${user?.lastName}'s Profile`,
                            text: `Check out ${user?.firstName}'s dating profile!`,
                            url: window.location.href,
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                        }
                      }}
                      className="border-2 border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 px-6 py-2.5 rounded-full flex items-center justify-center gap-2 font-semibold transition-all duration-300 hover:shadow-lg"
                    >
                      <Share2 size={18} />
                      Share Profile
                    </Button>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 px-6 py-2.5 rounded-full flex items-center justify-center gap-2 font-semibold transition-all duration-300 hover:shadow-lg md:hidden"
                    >
                      <LogOut size={18} />
                      Sign Out
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
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 min-w-[120px]">
                    <div className="text-2xl font-bold text-orange-600">{profile.completeness}%</div>
                    <div className="text-xs text-gray-600 font-medium">Complete</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-orange-600">{profile.fameRating}</div>
                    <div className="text-xs text-gray-600 font-medium">Fame</div>
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
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-orange-600">{profile.completeness}%</div>
                  <div className="text-xs text-gray-600 font-medium">Complete</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-orange-600">{profile.pictures.length}</div>
                  <div className="text-xs text-gray-600 font-medium">Photos</div>
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
            <div className="border-b border-orange-200">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-8 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => scrollToSection(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-orange-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>

              {/* Mobile Tab Navigation */}
              <div className="md:hidden mb-4">
                <div className="flex flex-wrap gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => scrollToSection(tab)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeTab === tab
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                <h2 className="text-2xl font-bold text-orange-600 mb-8">Information</h2>
                
                <div className="grid md:grid-cols-2 gap-x-12 gap-y-1">
                  {/* Left Column */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between py-4 border-b border-orange-200">
                      <div className="flex items-center gap-3">
                        <User size={16} className="text-orange-500" />
                        <dt className="text-gray-700 font-medium">Full Name</dt>
                      </div>
                      <dd className="text-gray-800 font-medium">{user?.firstName} {user?.lastName}</dd>
                    </div>
                    
                    <div className="flex items-center justify-between py-4 border-b border-orange-200">
                      <div className="flex items-center gap-3">
                        <Mail size={16} className="text-orange-500" />
                        <dt className="text-gray-700 font-medium">Email</dt>
                      </div>
                      <dd className="text-gray-800 font-medium">{user?.email}</dd>
                    </div>
                    
                    <div className="flex items-center justify-between py-4 border-b border-orange-200">
                      <div className="flex items-center gap-3">
                        <MapPin size={16} className="text-orange-500" />
                        <dt className="text-gray-700 font-medium">Location</dt>
                      </div>
                      <dd className="text-gray-800 font-medium">{profile.neighborhood || 'Not specified'}</dd>
                    </div>
                    
                    <div className="flex items-center justify-between py-4 border-b border-orange-200">
                      <div className="flex items-center gap-3">
                        <User size={16} className="text-orange-500" />
                        <dt className="text-gray-700 font-medium">Gender</dt>
                      </div>
                      <dd className="text-gray-800 font-medium">{genderLabel || 'Not specified'}</dd>
                    </div>

                    
                  </div>

                  {/* Right Column */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between py-4 border-b border-orange-200">
                      <div className="flex items-center gap-3">
                        <Star size={16} className="text-orange-500" />
                        <dt className="text-gray-700 font-medium">Fame Rating</dt>
                      </div>
                      <dd className="text-gray-800 font-medium">{profile.fameRating} ({fameInfo.level})</dd>
                    </div>
                    <div className="flex items-center justify-between py-4 border-b border-orange-200">
                      <div className="flex items-center gap-3">
                        <Heart size={16} className="text-orange-500" />
                        <dt className="text-gray-700 font-medium">Looking for</dt>
                      </div>
                      <dd className="text-gray-800 font-medium">{preferenceLabel || 'Not specified'}</dd>
                    </div>
                    
                    <div className="flex items-center justify-between py-4 border-b border-orange-200">
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-orange-500" />
                        <dt className="text-gray-700 font-medium">Age</dt>
                      </div>
                      <dd className="text-gray-800 font-medium">
                        {profile.dateOfBirth 
                          ? `${Math.floor((new Date().getTime() - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years old`
                          : 'Not specified'
                        }
                      </dd>
                    </div>
                    
                    <div className="flex items-center justify-between py-4 border-b border-orange-200">
                      <div className="flex items-center gap-3">
                        <User size={16} className="text-orange-500" />
                        <dt className="text-gray-700 font-medium">Profile Complete</dt>
                      </div>
                      <dd className="text-gray-800 font-medium">{profile.completeness}%</dd>
                    </div>
                  </div>
                </div>

                {/* Interests Tags */}
                {profile.interests.length > 0 && (
                  <div className="mt-12">
                    <h3 className="text-xl font-bold text-orange-600 mb-6">My Interests</h3>
                    <div className="flex flex-wrap gap-3">
                      {profile.interests.map((interest) => (
                        <span
                          key={interest.id}
                          className="px-4 py-2 bg-orange-100 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
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
                <h2 className="text-2xl font-bold text-orange-600 mb-8">Gallery</h2>
                
                {profile.pictures.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {profile.pictures.map((picture, index) => (
                      <div key={picture.id} className="relative">
                        <motion.div
                          className="aspect-[3/4] rounded-lg overflow-hidden border border-orange-200 hover:border-orange-400 transition-colors cursor-pointer"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Image
                            src={picture.url.startsWith('http') ? picture.url : `${STATIC_BASE_URL}${picture.url}`}
                            alt={`Photo ${index + 1}`}
                            width={400}
                            height={533}
                            className="w-full h-full object-cover"
                            unoptimized
                            onError={() => {
                              console.error('Gallery image load error:', picture.url);
                            }}
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
                ) : (
                  <div className="text-center py-16">
                    <Camera size={64} className="mx-auto text-orange-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No photos uploaded yet</h3>
                    <p className="text-gray-500 mb-6">Add some photos to make your profile more attractive</p>
                    <Button
                      onClick={() => router.push('/settings')}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <Edit size={16} className="mr-2" />
                      Add Photos
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Profile Views Section */}
            {activeTab === 'Profile Views' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                id="profile-views"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-orange-600">Profile Views</h2>
                  <div className="text-3xl font-bold text-orange-500">0</div>
                </div>
                
                <div className="text-center py-16">
                  <Eye size={64} className="mx-auto text-orange-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No views yet</h3>
                  <p className="text-gray-500 mb-6">Views will appear here when people visit your profile</p>
                  <Button
                    onClick={() => router.push(ROUTES.BROWSE)}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Eye size={16} className="mr-2" />
                    Browse Profiles
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Likes Received Section */}
            {activeTab === 'Likes Received' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                id="likes-received"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-orange-600">Likes Received</h2>
                  <div className="text-3xl font-bold text-orange-500">{likesReceived.length}</div>
                </div>
                
                {likesLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loading />
                  </div>
                ) : likesReceived.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {likesReceived.map((like) => (
                      <motion.div
                        key={like.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className=" rounded-xl border border-orange-200 p-2 hover:shadow-lg transition-all duration-200 hover:border-orange-300 cursor-pointer"
                        onClick={() => router.push(`/profile/${like.username}`)}
                      >
                        <div className="flex items-center gap-4">
                          {/* Profile Picture */}
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-orange-100 to-amber-50 flex-shrink-0">
                            {like.profilePicture ? (
                              <Image
                                src={like.profilePicture.startsWith('http') ? like.profilePicture : `${STATIC_BASE_URL}${like.profilePicture}`}
                                alt={`${like.firstName} ${like.lastName}`}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <User size={24} className="text-orange-400" />
                              </div>
                            )}
                          </div>

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {like.firstName} {like.lastName}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">@{like.username}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(like.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>

                          {/* Like Icon */}
                          <div className="flex-shrink-0">
                            <Heart size={20} className="text-red-500 fill-current" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Heart size={64} className="mx-auto text-orange-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No likes yet</h3>
                    <p className="text-gray-500 mb-6">Likes will appear here when people like your profile</p>
                    <Button
                      onClick={() => router.push('/settings')}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <Edit size={16} className="mr-2" />
                      Improve Profile
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
            
          </div>
    </div>
  );
}