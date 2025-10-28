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
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#F39C12]"></div>
      </div>
    );
  }

  const quickActions = [
    {
      icon: Search,
      title: 'Browse Profiles',
      description: 'Discover new connections',
      color: 'bg-[#F39C12]',
      route: ROUTES.BROWSE,
    },
    {
      icon: Heart,
      title: 'Your Matches',
      description: 'See who likes you back',
      color: 'bg-pink-500',
      route: ROUTES.PROFILE,
    },
    {
      icon: MessageCircle,
      title: 'Messages',
      description: 'Chat with your matches',
      color: 'bg-[#e08e0b]',
      route: ROUTES.CHAT,
    },
    {
      icon: User,
      title: 'Profile',
      description: 'View and edit your profile',
      color: 'bg-[#c27d08]',
      route: ROUTES.PROFILE,
    },
  ];

  return (
    <div className="py-8">
      {/* Welcome Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#f1f5f9] mb-4">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-lg text-[#94a3b8]">
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
                  <div className="text-3xl font-bold text-[#F39C12] mb-2">
                    {profile.completeness}%
                  </div>
                  <div className="text-sm text-[#94a3b8]">
                    Profile Complete
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#e08e0b] mb-2">
                    {profile.fameRating}
                  </div>
                  <div className="text-sm text-[#94a3b8]">
                    Fame Rating
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#F39C12] mb-2">
                    {profile.pictures.length}/5
                  </div>
                  <div className="text-sm text-[#94a3b8]">
                    Photos
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#e08e0b] mb-2">
                    {profile.interests.length}
                  </div>
                  <div className="text-sm text-[#94a3b8]">
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
        <h2 className="text-2xl font-bold text-[#f1f5f9] mb-8 text-center">
          What would you like to do?
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.title}
                className="group cursor-pointer"
                onClick={() => router.push(action.route)}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-200 border-0 bg-[#1e293b]/80 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex p-4 rounded-full ${action.color} mb-4 group-hover:scale-110 transition-transform duration-200`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <h3 className="font-semibold text-[#f1f5f9] mb-2">
                      {action.title}
                    </h3>
                    <p className="text-sm text-[#94a3b8]">
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
        <div className="bg-gradient-to-r from-[#F39C12] to-[#e08e0b] rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Start Your Journey Today!
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Thousands of amazing people are waiting to meet you.
          </p>
          <Button
            onClick={() => router.push(ROUTES.BROWSE)}
            size="lg"
            className="bg-white text-[#F39C12] hover:bg-gray-100 font-semibold px-8 py-3"
          >
            Start Browsing Profiles
          </Button>
        </div>
      </div>
    </div>
  );
}
