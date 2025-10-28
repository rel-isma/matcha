'use client';

import React from 'react';
import Image from 'next/image';
import { Heart, Eye, MapPin, User, Star } from 'lucide-react';
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
    <div className="relative w-full h-full max-w-sm mx-auto bg-card rounded-3xl shadow-2xl overflow-hidden aspect-[3/4] group">
      {/* Photo Container - Full card */}
      <div 
        className="relative w-full h-full cursor-pointer"
        onClick={() => onViewProfile(profile.username)}
      >
        {profilePicture ? (
          <Image
            src={profilePicture.url.startsWith('http') ? profilePicture.url : `${STATIC_BASE_URL}${profilePicture.url}`}
            alt={`${profile.firstName}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="400px"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-secondary-400 flex items-center justify-center">
            <User className="w-24 h-24 text-muted-foreground" strokeWidth={1.5} />
          </div>
        )}
        
        {/* Beautiful gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 via-60% to-transparent" />
        
        {/* Match indicator - top right */}
        {profile.hasLikedBack && (
          <div className="absolute top-6 right-6 bg-accent text-white text-sm font-bold px-4 py-2 rounded-full shadow-xl border-2 border-white/30">
            ✨ MATCH
          </div>
        )}

        {/* Fame Rating - top left */}
        <div className="absolute top-6 left-6">
          {profile.fameRating !== undefined && (
            <div className="bg-gradient-to-r from-yellow-500/80 to-amber-500/80 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30 flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              {profile.fameRating.toFixed(1)}
            </div>
          )}
        </div>

        {/* Profile Info - Bottom left */}
        <div className="absolute bottom-0 left-0 right-16 p-6 text-white">
          {/* Name with age badge */}
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-bold text-3xl text-white drop-shadow-2xl leading-none">
              {profile.firstName}
            </h1>
            {profile.age && (
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-semibold px-3 py-1 rounded-full">
                {profile.age}
              </div>
            )}
          </div>

          {/* Username */}
          <div className="mb-1">
            <p className="text-lg text-white/90 font-medium drop-shadow-lg">
              @{profile.username}
            </p>
          </div>

          {/* Location with distance */}
          {profile.neighborhood && (
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-white/80" />
              <span className="text-base text-white/85 font-medium drop-shadow">
                {profile.neighborhood}
                {profile.distance !== undefined && (
                  <span className="text-white/70">
                    {' • '}
                    {profile.distance < 0.1 ? 'Very close' : `${profile.distance.toFixed(1)}km`}
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Common interests count */}
          {profile.commonInterests && profile.commonInterests > 0 && (
            <div className="mt-1">
              <span className="bg-accent/80 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30">
                {profile.commonInterests} common interest{profile.commonInterests > 1 ? 's' : ''}
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
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-accent/80 transition-all duration-300 shadow-lg"
          >
            <Heart
              className={`w-5 h-5 transition-all duration-300 ${
                profile.isLiked ? 'text-accent fill-current' : 'text-white fill-none'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
