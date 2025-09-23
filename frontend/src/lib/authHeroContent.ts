// Auth hero content for different pages
export interface AuthHeroContent {
  gradient: string;
  profileName: string;
  profileAge: number;
  distance: string;
  compatibility: number;
  interests: Array<{ emoji: string; name: string; color: string }>;
  title: string;
  subtitle: string;
  stats: Array<{ value: string; label: string }>;
  ctaText: string;
}

export const authHeroContent: Record<string, AuthHeroContent> = {
  login: {
    gradient: 'from-pink-400 via-rose-500 to-red-500',
    profileName: 'Emma',
    profileAge: 24,
    distance: '1.2 km away',
    compatibility: 96,
    interests: [
      { emoji: '🎵', name: 'Music', color: 'bg-pink-100 text-pink-700' },
      { emoji: '📸', name: 'Photography', color: 'bg-rose-100 text-rose-700' },
      { emoji: '🍷', name: 'Wine', color: 'bg-red-100 text-red-700' }
    ],
    title: 'Welcome Back to Love',
    subtitle: 'Your perfect match might be just one swipe away. Continue your journey to find meaningful connections.',
    stats: [
      { value: '50K+', label: 'Happy Couples' },
      { value: '1M+', label: 'Matches Made' },
      { value: '95%', label: 'Success Rate' }
    ],
    ctaText: 'Continue Matching ❤️'
  },
  register: {
    gradient: 'from-purple-400 via-pink-500 to-rose-500',
    profileName: 'Alex',
    profileAge: 26,
    distance: '2.5 km away',
    compatibility: 89,
    interests: [
      { emoji: '🏋️‍♀️', name: 'Fitness', color: 'bg-purple-100 text-purple-700' },
      { emoji: '🌮', name: 'Foodie', color: 'bg-pink-100 text-pink-700' },
      { emoji: '✈️', name: 'Travel', color: 'bg-rose-100 text-rose-700' }
    ],
    title: 'Start Your Love Story',
    subtitle: 'Join thousands of singles finding their perfect match. Create your profile and discover amazing connections.',
    stats: [
      { value: '2M+', label: 'Active Users' },
      { value: '500+', label: 'Daily Matches' },
      { value: '89%', label: 'Find Someone' }
    ],
    ctaText: 'Join Matcha Now 💕'
  },
  verify: {
    gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
    profileName: 'Jordan',
    profileAge: 23,
    distance: '3.1 km away',
    compatibility: 92,
    interests: [
      { emoji: '🎨', name: 'Art', color: 'bg-emerald-100 text-emerald-700' },
      { emoji: '☕', name: 'Coffee', color: 'bg-teal-100 text-teal-700' },
      { emoji: '📚', name: 'Books', color: 'bg-cyan-100 text-cyan-700' }
    ],
    title: 'Almost There!',
    subtitle: 'Verify your email to unlock your full potential and start connecting with amazing people near you.',
    stats: [
      { value: '24/7', label: 'Support' },
      { value: '100%', label: 'Secure' },
      { value: '5min', label: 'Setup Time' }
    ],
    ctaText: 'Get Verified ✨'
  },
  'forgot-password': {
    gradient: 'from-indigo-400 via-purple-500 to-pink-500',
    profileName: 'Riley',
    profileAge: 27,
    distance: '1.8 km away',
    compatibility: 88,
    interests: [
      { emoji: '🧘‍♀️', name: 'Yoga', color: 'bg-indigo-100 text-indigo-700' },
      { emoji: '🌱', name: 'Nature', color: 'bg-purple-100 text-purple-700' },
      { emoji: '🎭', name: 'Theater', color: 'bg-pink-100 text-pink-700' }
    ],
    title: 'We\'ve Got You Covered',
    subtitle: 'Reset your password safely and get back to discovering meaningful connections. Your perfect match is waiting.',
    stats: [
      { value: 'Instant', label: 'Recovery' },
      { value: '100%', label: 'Safe' },
      { value: '24/7', label: 'Access' }
    ],
    ctaText: 'Secure Reset 🔒'
  }
};

export const getAuthHeroContent = (pathname: string): AuthHeroContent => {
  const page = pathname.split('/').pop() || 'login';
  return authHeroContent[page] || authHeroContent.login;
};
