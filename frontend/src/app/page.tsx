"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Heart, MapPin, MessageCircle, Shield, Users, Star, ArrowRight, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function MatchaLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect authenticated and verified users to dashboard
    if (!isLoading && user && user.isVerified) {
      router.push('/browse');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't render landing page for authenticated and verified users
  if (!isLoading && user && user.isVerified) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-primary-50 to-teal-50">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Image 
                src="/logo/logoAbig.svg" 
                alt="Matcha" 
                width={96}
                height={32}
                className="h-8 w-auto"
                priority
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-secondary-700 hover:text-primary-600 font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-secondary-700 hover:text-primary-600 font-medium transition-colors">How it Works</a>
              <a href="/login" className="text-secondary-700 hover:text-primary-600 font-medium transition-colors">Login</a>
              <a href="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-full font-medium transform hover:scale-105 transition-all duration-200 shadow-lg">
                Register
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-secondary-700 hover:text-primary-600"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 py-4">
              <div className="flex flex-col space-y-4 px-4">
                <a 
                  href="#features" 
                  className="text-secondary-700 hover:text-primary-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#how-it-works" 
                  className="text-secondary-700 hover:text-primary-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  How it Works
                </a>
                <a 
                  href="/login" 
                  className="text-secondary-700 hover:text-primary-600 font-medium text-left"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </a>
                <a 
                  href="/register" 
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-full font-medium w-full text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 pb-16 sm:pb-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center bg-primary-100 text-primary-800 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Over 10,000+ Success Stories
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-secondary-900 mb-4 sm:mb-6 leading-tight">
                Where Love
                <span className="block text-primary-500">
                  Finds a Way
                </span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-secondary-600 mb-6 sm:mb-8 leading-relaxed px-2 sm:px-0">
                Join the most intelligent dating platform that connects hearts through 
                smart matching, real conversations, and meaningful connections.
              </p>

              <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8 px-2 sm:px-0">
                <a href="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center group">
                  Start Your Journey
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-6 sm:pt-8 border-t border-gray-100 px-2 sm:px-0">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-600 mb-1">10K+</div>
                  <div className="text-xs sm:text-sm text-secondary-600">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-600 mb-1">2.5K+</div>
                  <div className="text-xs sm:text-sm text-secondary-600">Matches Daily</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-600 mb-1">95%</div>
                  <div className="text-xs sm:text-sm text-secondary-600">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Hero Image/Animation */}
            <div className="relative mt-8 lg:mt-0">
              <div className="relative">
                {/* Main Image Container */}
                <div className="bg-primary-400 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl transform rotate-2 sm:rotate-3 hover:rotate-1 transition-transform duration-500 mx-4 sm:mx-0">
                  <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3 lg:space-y-4">
                    {/* Fake Profile Cards */}
                    <div className="flex items-center space-x-2 sm:space-x-3 bg-primary-50 p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-primary-400 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="h-2 sm:h-2.5 lg:h-3 bg-gray-200 rounded w-16 sm:w-20 lg:w-24 mb-1 sm:mb-2"></div>
                        <div className="h-1.5 sm:h-2 bg-gray-100 rounded w-10 sm:w-12 lg:w-16"></div>
                      </div>
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary-500 flex-shrink-0" />
                    </div>
                    
                    <div className="flex items-center space-x-2 sm:space-x-3 bg-teal-50 p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-teal-400 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="h-2 sm:h-2.5 lg:h-3 bg-gray-200 rounded w-14 sm:w-16 lg:w-20 mb-1 sm:mb-2"></div>
                        <div className="h-1.5 sm:h-2 bg-gray-100 rounded w-8 sm:w-10 lg:w-12"></div>
                      </div>
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary-500 fill-current flex-shrink-0" />
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-3 bg-cream p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-secondary-400 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="h-2 sm:h-2.5 lg:h-3 bg-gray-200 rounded w-18 sm:w-22 lg:w-28 mb-1 sm:mb-2"></div>
                        <div className="h-1.5 sm:h-2 bg-gray-100 rounded w-12 sm:w-16 lg:w-20"></div>
                      </div>
                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary-500 flex-shrink-0" />
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-2 -left-2 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-yellow-400 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 sm:-bottom-4 sm:-right-4 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Pattern */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary-200 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-teal-200 rounded-full opacity-20 animate-bounce" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-secondary-200 rounded-full opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary-900 mb-3 sm:mb-4 px-2">
              Why Choose <span className="text-primary-600">Matcha</span>?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-secondary-600 max-w-3xl mx-auto px-4 sm:px-0">
              Our intelligent platform combines advanced matching algorithms with real human connections
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="bg-primary-50 p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-primary-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-primary-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform mx-auto sm:mx-0">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-secondary-900 mb-3 sm:mb-4 text-center sm:text-left">Smart Matching</h3>
              <p className="text-sm sm:text-base text-secondary-600 leading-relaxed text-center sm:text-left">
                Our AI-powered algorithm analyzes compatibility based on interests, location, and personality to find your perfect match.
              </p>
            </div>

            <div className="bg-teal-50 p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-teal-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-teal-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform mx-auto sm:mx-0">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-secondary-900 mb-3 sm:mb-4 text-center sm:text-left">Location-Based</h3>
              <p className="text-sm sm:text-base text-secondary-600 leading-relaxed text-center sm:text-left">
                Connect with people near you using precise GPS matching, making it easier to meet in real life.
              </p>
            </div>

            <div className="bg-secondary-50 p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-secondary-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-secondary-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform mx-auto sm:mx-0">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-secondary-900 mb-3 sm:mb-4 text-center sm:text-left">Real-Time Chat</h3>
              <p className="text-sm sm:text-base text-secondary-600 leading-relaxed text-center sm:text-left">
                Start meaningful conversations instantly with our seamless messaging system and build genuine connections.
              </p>
            </div>

            <div className="bg-primary-50 p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-primary-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-primary-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform mx-auto sm:mx-0">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-secondary-900 mb-3 sm:mb-4 text-center sm:text-left">Verified Profiles</h3>
              <p className="text-sm sm:text-base text-secondary-600 leading-relaxed text-center sm:text-left">
                Every profile is verified for authenticity, ensuring you connect with real people looking for genuine relationships.
              </p>
            </div>

            <div className="bg-teal-50 p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-teal-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-teal-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform mx-auto sm:mx-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-secondary-900 mb-3 sm:mb-4 text-center sm:text-left">Active Community</h3>
              <p className="text-sm sm:text-base text-secondary-600 leading-relaxed text-center sm:text-left">
                Join thousands of active users who are serious about finding love and building meaningful relationships.
              </p>
            </div>

            <div className="bg-secondary-50 p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-secondary-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-secondary-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform mx-auto sm:mx-0">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-secondary-900 mb-3 sm:mb-4 text-center sm:text-left">Fame Rating</h3>
              <p className="text-sm sm:text-base text-secondary-600 leading-relaxed text-center sm:text-left">
                Our unique rating system helps you discover the most popular and engaging profiles in your area.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary-900 mb-3 sm:mb-4 px-2">
              Find Love in <span className="text-primary-600">3 Simple Steps</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-secondary-600 px-4 sm:px-0">
              Getting started with Matcha is easy and takes just a few minutes
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
            <div className="text-center group">
              <div className="relative mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-primary-500 rounded-2xl sm:rounded-3xl mx-auto flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">1</span>
                </div>
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-teal-400 rounded-full flex items-center justify-center">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-secondary-900 mb-3 sm:mb-4">Create Your Profile</h3>
              <p className="text-sm sm:text-base text-secondary-600 leading-relaxed px-2 sm:px-0">
                Sign up with your email, add photos, write a compelling bio, and set your preferences to attract the right matches.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-teal-500 rounded-2xl sm:rounded-3xl mx-auto flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">2</span>
                </div>
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-primary-400 rounded-full flex items-center justify-center">
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-secondary-900 mb-3 sm:mb-4">Discover Matches</h3>
              <p className="text-sm sm:text-base text-secondary-600 leading-relaxed px-2 sm:px-0">
                Browse through intelligent suggestions, use advanced search filters, and like profiles that catch your interest.
              </p>
            </div>

            <div className="text-center group sm:col-span-2 lg:col-span-1">
              <div className="relative mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-secondary-500 rounded-2xl sm:rounded-3xl mx-auto flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">3</span>
                </div>
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-teal-400 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-secondary-900 mb-3 sm:mb-4">Start Chatting</h3>
              <p className="text-sm sm:text-base text-secondary-600 leading-relaxed px-2 sm:px-0">
                When you both like each other, start a conversation and build a meaningful connection that could last forever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-primary-500 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center px-3 sm:px-4 lg:px-8 relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 px-2">
            Ready to Find Your Perfect Match?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-primary-100 mb-6 sm:mb-8 px-2">
            Join thousands of happy couples who found love on Matcha. Your soulmate is waiting for you.
          </p>
          <div className="flex justify-center px-2 sm:px-0">
            <a href="/register" className="bg-white text-primary-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-primary-50 transform hover:scale-105 transition-all duration-200 shadow-lg">
              Get Started Free
            </a>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-4 sm:left-10 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 border-2 border-white/20 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 right-4 sm:right-10 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 border-2 border-white/20 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 border-2 border-white/20 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <Image 
                src="/logo/logoAbig.svg" 
                alt="Matcha" 
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </div>
            <p className="text-secondary-400 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base px-4">
              Where meaningful connections begin. Join millions of people finding love, friendship, and everything in between.
            </p>
            <div className="border-t border-secondary-700 pt-4 sm:pt-6">
              <p className="text-xs sm:text-sm text-secondary-500">
                © 2025 Matcha. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}