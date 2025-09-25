// Profile Page - User's Own Profile View
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Edit, MapPin, Heart, Eye, Star, Calendar, Mail, User } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useProfile } from '../../../hooks/useProfile';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Avatar } from '../../../components/ui/Avatar';
import { Loading } from '../../../components/ui/Spinner';
import { ROUTES, GENDER_OPTIONS, SEXUAL_PREFERENCE_OPTIONS, INTEREST_OPTIONS } from '../../../lib/constants';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, loading, error } = useProfile();

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error ? 'Error Loading Profile' : 'Profile Not Found'}
          </h1>
          {error && (
            <p className="text-red-600 dark:text-red-400 mb-4">
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
    if (rating >= 500) return { level: 'Diamond', color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30' };
    if (rating >= 300) return { level: 'Platinum', color: 'text-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-900/20' };
    if (rating >= 150) return { level: 'Gold', color: 'text-amber-500', bgColor: 'bg-amber-100 dark:bg-amber-900/30' };
    if (rating >= 50) return { level: 'Silver', color: 'text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/20' };
    return { level: 'Bronze', color: 'text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/30' };
  };

  const fameInfo = getFameLevel(profile.fameRating);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Mobile Edit Button - Floating */}
        <div className="md:hidden fixed bottom-6 right-6 z-50">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              onClick={() => router.push(ROUTES.EDIT_PROFILE)}
              className="rounded-full w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg flex items-center justify-center hover:from-orange-600 hover:to-amber-600"
            >
              <Edit size={20} />
            </Button>
          </motion.div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Profile Card */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="relative">
                    {/* Desktop Edit Button */}
                    <div className="hidden md:block absolute top-4 right-4 z-10">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(ROUTES.EDIT_PROFILE)}
                        className="bg-white/90 backdrop-blur-sm hover:bg-white"
                      >
                        <Edit size={16} className="mr-2" />
                        Edit Profile
                      </Button>
                    </div>

                    {/* Profile Photos Carousel/Grid */}
                    <div className="aspect-video bg-gradient-to-r from-orange-200 to-amber-200 dark:from-orange-900 dark:to-amber-900 rounded-lg overflow-hidden">
                      {profile.pictures.length > 0 ? (
                        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-2 h-full p-2">
                          {profile.pictures.slice(0, 6).map((picture, index) => (
                            <motion.div
                              key={picture.id}
                              className={`rounded-lg overflow-hidden ${index === 0 ? 'md:col-span-2 lg:col-span-2 lg:row-span-2' : ''}`}
                              whileHover={{ scale: 1.02 }}
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
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <User size={48} className="mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-600 dark:text-gray-300">No photos uploaded</p>
                          </div>
                        </div>
                      )}

                      {/* Mobile - Show first photo or placeholder */}
                      <div className="md:hidden h-full">
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
                          <div className="flex items-center justify-center h-full">
                            <User size={48} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    {/* Basic Info */}
                    <div className="mb-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div>
                          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {user?.firstName} {user?.lastName}
                          </h1>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <User size={16} />
                            <span>@{user?.username}</span>
                          </div>
                        </div>
                      </div>

                      {/* Fame Rating */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className={`px-3 py-1 rounded-full ${fameInfo.bgColor} flex items-center gap-2`}>
                          <Star size={16} className={fameInfo.color} />
                          <span className={`font-medium ${fameInfo.color}`}>
                            {fameInfo.level}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            ({profile.fameRating})
                          </span>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <Mail size={16} />
                          <span>{user?.email}</span>
                        </div>
                        {profile.neighborhood && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <MapPin size={16} />
                            <span>{profile.neighborhood}</span>
                          </div>
                        )}
                      </div>

                      {/* Gender & Preference */}
                      {(profile.gender || profile.sexualPreference) && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {profile.gender && (
                            <Badge variant="outline">
                              {genderLabel}
                            </Badge>
                          )}
                          {profile.sexualPreference && (
                            <Badge variant="outline">
                              Looking for {preferenceLabel}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          About Me
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {profile.bio}
                        </p>
                      </div>
                    )}

                    {/* Interests */}
                    {profile.interests.length > 0 && (
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          Interests
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {profile.interests.map((interest) => {
                            const interestOption = INTEREST_OPTIONS.find(opt => opt.name === interest.name);
                            return (
                              <Badge
                                key={interest.id}
                                variant="secondary"
                                className="bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700"
                              >
                                {interest.name}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star size={20} />
                      Profile Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">Completeness</span>
                        <span className="font-medium">{profile.completeness}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${profile.completeness}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">Fame Rating</span>
                        <span className="font-medium">{profile.fameRating}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">Photos</span>
                        <span className="font-medium">{profile.pictures.length}/5</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">Interests</span>
                        <span className="font-medium">{profile.interests.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Who Viewed My Profile */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye size={20} />
                      Profile Views
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Eye size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Profile views will appear here
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Who Liked Me */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart size={20} />
                      Likes Received
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Heart size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Your likes will appear here
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
