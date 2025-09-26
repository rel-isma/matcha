// Profile Page - User's Own Profile View
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Edit, MapPin, Heart, Eye, Star, Calendar, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Spinner';
import { ROUTES, GENDER_OPTIONS, SEXUAL_PREFERENCE_OPTIONS } from '../../../lib/constants';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, loading, error } = useProfile();
  const [activeTab, setActiveTab] = useState('Information');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  // Get fame rating color and level
  const getFameLevel = (rating: number) => {
    if (rating >= 500) return { level: 'Diamond', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    if (rating >= 300) return { level: 'Platinum', color: 'text-orange-500', bgColor: 'bg-orange-50' };
    if (rating >= 150) return { level: 'Gold', color: 'text-amber-500', bgColor: 'bg-amber-100' };
    if (rating >= 50) return { level: 'Silver', color: 'text-amber-400', bgColor: 'bg-amber-50' };
    return { level: 'Bronze', color: 'text-orange-400', bgColor: 'bg-orange-100' };
  };

  const fameInfo = getFameLevel(profile.fameRating);

  const tabs = ['Information', 'Gallery', 'Profile Views', 'Likes Received'];

  const scrollToSection = (sectionName: string) => {
    setActiveTab(sectionName);
    
    const sectionMap: { [key: string]: string } = {
      'Information': 'information',
      'Gallery': 'gallery',
      'Profile Views': 'profile-views',
      'Likes Received': 'likes-received'
    };
    
    const sectionId = sectionMap[sectionName];
    if (sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest' 
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with Profile Image and Basic Info */}
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            {/* Profile Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="flex-shrink-0 mx-auto lg:mx-0"
            >
              <div className="relative">
                <div className="w-40 h-56 rounded-xl overflow-hidden border-4 border-orange-300 shadow-xl bg-white">
                  {profile.pictures.length > 0 ? (
                    <img
                      src={`http://localhost:5000${profile.pictures[0].url}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Image load error:', profile.pictures[0].url);
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-orange-100">
                      <User size={64} className="text-orange-400" />
                    </div>
                  )}
                </div>
                
                {/* Edit Button on Image */}
                <div className="absolute top-2 right-2">
                  <Button
                    size="sm"
                    onClick={() => router.push(ROUTES.EDIT_PROFILE)}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full shadow-lg"
                  >
                    <Edit size={14} />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Profile Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-1 text-center lg:text-left"
            >
              <div className="mb-6">
                <h1 className="text-3xl lg:text-4xl font-bold text-orange-600 mb-2">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-gray-600 text-sm mb-1">@{user?.username} • Dating Profile • Looking for Connections</p>
                
                <p className="text-gray-700 text-sm leading-relaxed mb-6 max-w-2xl">
                  {profile.bio || `${user?.firstName} is looking for meaningful connections and interesting conversations. Here to meet new people and see what happens!`}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Navigation Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <div className="border-b-2 border-gray-200">
              <nav className="flex space-x-8 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => scrollToSection(tab)}
                    className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* All Content in One Scrollable View */}
          <div className="space-y-12">
            {/* Information Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              id="information"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Information</h2>
              
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 py-4 border-b border-gray-200">
                      <div className="w-6 h-6 flex items-center justify-center">
                        <User size={18} className="text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <dt className="text-gray-500 text-sm font-medium">Full Name</dt>
                        <dd className="text-gray-900 text-lg">{user?.firstName} {user?.lastName}</dd>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 py-4 border-b border-gray-200">
                      <div className="w-6 h-6 flex items-center justify-center">
                        <MapPin size={18} className="text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <dt className="text-gray-500 text-sm font-medium">Location</dt>
                        <dd className="text-gray-900">{profile.neighborhood || 'Not specified'}</dd>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 py-4 border-b border-gray-200">
                      <div className="w-6 h-6 flex items-center justify-center">
                        <User size={18} className="text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <dt className="text-gray-500 text-sm font-medium">Gender</dt>
                        <dd className="text-gray-900">{genderLabel || 'Not specified'}</dd>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 py-4 border-b border-gray-200">
                      <div className="w-6 h-6 flex items-center justify-center">
                        <Star size={18} className="text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <dt className="text-gray-500 text-sm font-medium">Fame Rating</dt>
                        <dd className="text-gray-900">{profile.fameRating} ({fameInfo.level})</dd>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 py-4 border-b border-gray-200">
                      <div className="w-6 h-6 flex items-center justify-center">
                        <Calendar size={18} className="text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <dt className="text-gray-500 text-sm font-medium">Age</dt>
                        <dd className="text-gray-900">{profile.age || 'Not specified'}</dd>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 py-4 border-b border-gray-200">
                      <div className="w-6 h-6 flex items-center justify-center">
                        <Heart size={18} className="text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <dt className="text-gray-500 text-sm font-medium">Looking for</dt>
                        <dd className="text-gray-900">{preferenceLabel || 'Not specified'}</dd>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 py-4 border-b border-gray-200">
                      <div className="w-6 h-6 flex items-center justify-center">
                        <Star size={18} className="text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <dt className="text-gray-500 text-sm font-medium">Interests</dt>
                        <dd className="text-gray-900">{profile.interests.length} interests</dd>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 py-4 border-b border-gray-200">
                      <div className="w-6 h-6 flex items-center justify-center">
                        <User size={18} className="text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <dt className="text-gray-500 text-sm font-medium">Profile Complete</dt>
                        <dd className="text-gray-900">{profile.completeness}%</dd>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interests */}
                {profile.interests.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Interests</h3>
                    <div className="flex flex-wrap gap-3">
                      {profile.interests.map((interest) => (
                        <span
                          key={interest.id}
                          className="px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200 text-orange-800 text-sm rounded-full hover:from-orange-200 hover:to-amber-200 transition-colors"
                        >
                          {interest.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Gallery Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              id="gallery"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Gallery</h2>
              
              <div className="bg-white rounded-lg shadow-lg p-8">
                {profile.pictures.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {profile.pictures.map((picture, index) => (
                      <motion.div
                        key={picture.id}
                        className="aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-md relative group cursor-pointer border-2 border-gray-200 hover:border-orange-400 transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <img
                          src={`http://localhost:5000${picture.url}`}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Image load error:', picture.url);
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                        {picture.isProfilePic && (
                          <div className="absolute top-2 left-2">
                            <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                              Main
                            </span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <User size={64} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-6">No photos uploaded yet</p>
                    <Button
                      onClick={() => router.push(ROUTES.EDIT_PROFILE)}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                    >
                      <Edit size={16} className="mr-2" />
                      Add Photos
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Profile Views Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              id="profile-views"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Profile Views</h2>
                <div className="text-3xl font-bold text-orange-600">0</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center py-16">
                  <Eye size={64} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No views yet</h3>
                  <p className="text-gray-500 mb-6">
                    Views will appear here when people visit your profile
                  </p>
                  <Button
                    onClick={() => router.push(ROUTES.BROWSE)}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  >
                    <Eye size={16} className="mr-2" />
                    Browse Profiles
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Likes Received Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              id="likes-received"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Likes Received</h2>
                <div className="text-3xl font-bold text-orange-600">0</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center py-16">
                  <Heart size={64} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No likes yet</h3>
                  <p className="text-gray-500 mb-6">
                    Likes will appear here when people like your profile
                  </p>
                  <Button
                    onClick={() => router.push(ROUTES.EDIT_PROFILE)}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  >
                    <Edit size={16} className="mr-2" />
                    Improve Profile
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
