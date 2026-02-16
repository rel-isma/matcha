"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user && user.isVerified) {
        router.push('/browse');
      } else {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  return null;
}