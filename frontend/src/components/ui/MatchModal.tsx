'use client';

import React from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, X } from 'lucide-react';
import { STATIC_BASE_URL } from '@/lib/constants';

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserPicture?: string;
  currentUserName?: string;
  matchedUserPicture?: string;
  matchedUserName?: string;
  onStartChat: () => void;
  onKeepBrowsing: () => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({
  isOpen,
  onClose,
  currentUserPicture,
  currentUserName,
  matchedUserPicture,
  matchedUserName,
  onStartChat,
  onKeepBrowsing
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with gradient */}
      <div 
        className="fixed inset-0 bg-gradient-to-br from-pink-400/80 via-orange-400/80 to-amber-400/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-orange-50 to-amber-50 opacity-60" />
        
        {/* Floating hearts animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-8 text-pink-300 animate-bounce" style={{ animationDelay: '0s' }}>
            <Heart className="w-4 h-4 fill-current" />
          </div>
          <div className="absolute top-16 right-12 text-orange-300 animate-bounce" style={{ animationDelay: '0.5s' }}>
            <Heart className="w-3 h-3 fill-current" />
          </div>
          <div className="absolute top-24 left-16 text-amber-300 animate-bounce" style={{ animationDelay: '1s' }}>
            <Heart className="w-2 h-2 fill-current" />
          </div>
          <div className="absolute top-32 right-8 text-pink-300 animate-bounce" style={{ animationDelay: '1.5s' }}>
            <Heart className="w-3 h-3 fill-current" />
          </div>
        </div>

        {/* Content */}
        <div className="relative p-6 pt-12 text-center">
          {/* Profile Pictures */}
          <div className="relative mb-6">
            {/* Connection line */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-0.5 bg-gradient-to-r from-pink-300 via-orange-300 to-amber-300 z-0" />
            
            {/* Current user picture */}
            <div className="absolute left-8 top-0 transform rotate-12">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg bg-white border-4 border-white">
                {currentUserPicture ? (
                  <Image
                    src={`${STATIC_BASE_URL}${currentUserPicture}`}
                    alt={currentUserName || 'You'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center">
                    <Heart className="w-8 h-8 text-orange-400" />
                  </div>
                )}
              </div>
              {/* Heart icon on photo */}
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Heart className="w-3 h-3 text-white fill-current" />
              </div>
            </div>

            {/* Matched user picture */}
            <div className="absolute right-8 top-0 transform -rotate-12">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg bg-white border-4 border-white">
                {matchedUserPicture ? (
                  <Image
                    src={`${STATIC_BASE_URL}${matchedUserPicture}`}
                    alt={matchedUserName || 'Match'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center">
                    <Heart className="w-8 h-8 text-orange-400" />
                  </div>
                )}
              </div>
              {/* Heart icon on photo */}
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                <Heart className="w-3 h-3 text-white fill-current" />
              </div>
            </div>

            {/* Central heart */}
            <div className="relative z-10 w-16 h-16 mx-auto bg-gradient-to-r from-pink-500 via-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-xl animate-pulse">
              <Heart className="w-8 h-8 text-white fill-current" />
            </div>
          </div>

          {/* Text content */}
          <div className="mb-8">
            <p className="text-orange-500 font-semibold text-sm uppercase tracking-wider mb-2">
              CONGRATULATIONS
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              It&apos;s a match, {currentUserName || 'there'}!
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Start a conversation now with each other
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            {/* Say hello button */}
            <button
              onClick={onStartChat}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Say hello
            </button>

            {/* Keep browsing button */}
            <button
              onClick={onKeepBrowsing}
              className="w-full text-orange-500 font-medium py-3 px-6 rounded-2xl hover:bg-orange-50 transition-colors duration-300"
            >
              Keep browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};