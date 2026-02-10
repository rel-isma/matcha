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
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-card/95 backdrop-blur-md shadow-lg border-b border-border' : 'bg-transparent'
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
                unoptimized
                priority
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-accent font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-accent font-medium transition-colors">How it Works</a>
              <a href="/login" className="text-muted-foreground hover:text-accent font-medium transition-colors">Login</a>
              <a href="/register" className="bg-accent hover:bg-primary-600 text-white px-6 py-2 rounded-full font-medium transform hover:scale-105 transition-all duration-200 shadow-lg">
                Register
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-muted-foreground hover:text-accent"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-card/95 backdrop-blur-md border-t border-border py-4">
              <div className="flex flex-col space-y-4 px-4">
                <a 
                  href="#features" 
                  className="text-muted-foreground hover:text-accent font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#how-it-works" 
                  className="text-muted-foreground hover:text-accent font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  How it Works
                </a>
                <a 
                  href="/login" 
                  className="text-muted-foreground hover:text-accent font-medium text-left"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </a>
                <a 
                  href="/register" 
                  className="bg-accent hover:bg-primary-600 text-white px-6 py-2 rounded-full font-medium w-full text-center"
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
      <section className="pt-32 sm:pt-40 pb-20 sm:pb-28 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Find Your
              <span className="block text-accent mt-2">
                Perfect Match
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              Smart matching algorithm that connects you with people who share your interests and values.
            </p>

            {/* CTA Button */}
            <div className="mb-16">
              <a href="/register" className="inline-flex items-center bg-accent hover:bg-primary-600 text-white px-10 py-4 rounded-full font-semibold text-lg transform hover:scale-105 transition-all duration-200 shadow-xl">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </div>

            {/* Simple Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 border-t border-border">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-1">10K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-1">2.5K+</div>
                <div className="text-sm text-muted-foreground">Daily Matches</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-1">95%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Background Decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Why Choose <span className="text-accent">Matcha</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to find meaningful connections
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Smart Matching</h3>
              <p className="text-muted-foreground">
                AI-powered algorithm finds your perfect match
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Location-Based</h3>
              <p className="text-muted-foreground">
                Connect with people nearby using GPS
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Real-Time Chat</h3>
              <p className="text-muted-foreground">
                Start conversations instantly
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Verified Profiles</h3>
              <p className="text-muted-foreground">
                Every profile is verified for authenticity
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Active Community</h3>
              <p className="text-muted-foreground">
                Join thousands of active users
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Fame Rating</h3>
              <p className="text-muted-foreground">
                Discover popular profiles in your area
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              How It <span className="text-accent">Works</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Three simple steps to find your perfect match
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-accent rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Create Profile</h3>
              <p className="text-muted-foreground">
                Sign up and complete your profile
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-accent rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Find Matches</h3>
              <p className="text-muted-foreground">
                Browse and like profiles you&apos;re interested in
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-accent rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Start Chatting</h3>
              <p className="text-muted-foreground">
                Connect and build meaningful relationships
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-accent">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Find Love?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of happy couples who found their match on Matcha
          </p>
          <a href="/register" className="inline-flex items-center bg-white text-accent px-8 py-4 rounded-full font-bold text-lg hover:bg-white/90 transform hover:scale-105 transition-all duration-200 shadow-xl">
            Get Started Free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Image 
                src="/logo/logoAbig.svg" 
                alt="Matcha" 
                width={120}
                height={40}
                className="h-8 w-auto"
                unoptimized
              />
            </div>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Where meaningful connections begin
            </p>
            <div className="border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">
                © 2025 Matcha. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}