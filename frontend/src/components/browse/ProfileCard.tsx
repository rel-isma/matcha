'use client';

import React from 'react';
import Image from 'next/image';
import { X, Heart, Eye } from 'lucide-react';
import { STATIC_BASE_URL } from '@/lib/constants';
import { ProfileCardData } from '@/types';

interface ProfileCardProps {
  profile: ProfileCardData;
  onLike: (userId: string) => void;
  onUnlike: (userId: string) => void;
  onViewProfile: (username: string) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onLike,
  onUnlike,
  onViewProfile
}) => {
  const profilePicture = profile.pictures.find(p => p.isProfilePic) || profile.pictures[0];
  console.log('profile:', profile); 
  return (
    <div className="relative w-full h-full max-w-sm mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden aspect-[3/4] group">
      {/* Photo Container - Full card */}
      <div 
        className="relative w-full h-full cursor-pointer"
        onClick={() => onViewProfile(profile.username)}
      >
        {profilePicture ? (
          <Image
            src={`${STATIC_BASE_URL}${profilePicture.url}`}
            alt={`${profile.firstName}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="400px"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-200 to-primary-200 flex items-center justify-center">
            <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
        
        {/* Beautiful gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 via-60% to-transparent" />
        
        {/* Match indicator - top right */}
        {profile.hasLikedBack && (
          <div className="absolute top-6 right-6 bg-gradient-to-r from-primary-400 to-primary-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-xl border-2 border-white/30">
            ✨ MATCH
          </div>
        )}

        {/* Distance indicator - top left */}
        <div className="absolute top-6 left-6 bg-black/30 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full border border-white/20">
          📍 {profile.distance ? `${profile.distance.toFixed(1)} km` : 'Location unknown'}
        </div>

        {/* Profile Info - Bottom left */}
        <div className="absolute bottom-0 left-0 p-6 text-white">
          {/* Name and Age - Large text */}
          <div className="flex items-end gap-2 mb-1">
            <h1 className="font-bold text-3xl text-white drop-shadow-2xl leading-none">
              {profile.firstName}
            </h1>
            {profile.age && (
              <span className="text-2xl font-medium text-white/95 drop-shadow-lg">
                {profile.age}
              </span>
            )}
          </div>

          {/* Username/Occupation */}
          <div className="mb-3">
            <p className="text-lg text-white/90 font-medium drop-shadow-lg">
              @{profile.username}
            </p>
          </div>

          {/* Location */}
          {profile.neighborhood && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-base text-white/85 font-medium drop-shadow">
                {profile.neighborhood}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons - Absolute positioned on right side vertically */}
        <div className="absolute bottom-6 right-2 flex flex-col gap-3">
          {/* View Profile Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile(profile.username);
            }}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-blue-500/80 transition-all duration-300 shadow-lg"
          >
            <Eye className="w-5 h-5 text-white" />
          </button>

          {/* Like Button - Same size and theme as others */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (profile.isLiked) {
                onUnlike(profile.userId);
              } else {
                onLike(profile.userId);
              }
            }}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-primary-500/80 transition-all duration-300 shadow-lg"
          >
            <Heart
              className={`w-5 h-5 transition-all duration-300 ${
                profile.isLiked ? 'text-orange-500 fill-current' : 'text-white fill-none'
              }`}
            />
          </button>

          {/* Dislike Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (profile.isLiked) {
                onUnlike(profile.userId);
              }
            }}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-red-500/80 transition-all duration-300 shadow-lg"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
