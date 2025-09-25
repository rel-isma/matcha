'use client';

import { useRouter } from 'next/navigation';
import { Heart, Search, MessageCircle, User, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { ROUTES } from '../../lib/constants';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const quickActions = [
    {
      icon: Search,
      title: 'Browse Profiles',
      description: 'Discover new connections',
      color: 'bg-gradient-to-r from-orange-500 to-amber-500',
      route: ROUTES.BROWSE,
    },
    {
      icon: Heart,
      title: 'Your Matches',
      description: 'See who likes you back',
      color: 'bg-gradient-to-r from-red-500 to-orange-500',
      route: ROUTES.PROFILE,
    },
    {
      icon: MessageCircle,
      title: 'Messages',
      description: 'Chat with your matches',
      color: 'bg-gradient-to-r from-amber-500 to-yellow-500',
      route: ROUTES.CHAT,
    },
    {
      icon: User,
      title: 'Profile',
      description: 'View and edit your profile',
      color: 'bg-gradient-to-r from-orange-600 to-red-500',
      route: ROUTES.PROFILE,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Ready to find your perfect match?
          </p>
        </div>

        {/* Profile Stats */}
        {profile && (
          <div className="max-w-4xl mx-auto mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp size={20} />
                  Your Profile Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-500 mb-2">
                      {profile.completeness}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Profile Complete
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-500 mb-2">
                      {profile.fameRating}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Fame Rating
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {profile.pictures.length}/5
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Photos
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-600 mb-2">
                      {profile.interests.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Interests
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            What would you like to do?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div
                  key={action.title}
                  className="group cursor-pointer"
                  onClick={() => router.push(action.route)}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-200 border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6 text-center">
                      <div className={`inline-flex p-4 rounded-full ${action.color} mb-4 group-hover:scale-110 transition-transform duration-200`}>
                        <Icon size={24} className="text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Start Your Journey Today!
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Thousands of amazing people are waiting to meet you.
            </p>
            <Button
              onClick={() => router.push(ROUTES.BROWSE)}
              size="lg"
              className="bg-white text-orange-500 hover:bg-gray-100 font-semibold px-8 py-3"
            >
              Start Browsing Profiles
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
