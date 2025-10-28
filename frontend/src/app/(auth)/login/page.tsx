import { LoginForm } from '@/components/forms/LoginForm';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        {/* Matcha Logo */}
        <div className="mb-4 sm:mb-6 flex justify-center">
          <Image 
            src="/logo/logoAbig.svg" 
            alt="Matcha" 
            width={120}
            height={40}
            className="h-7 sm:h-8 w-auto"
            priority
          />
        </div>
        
        {/* Page Title */}
        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Sign in</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Don&apos;t have an account?{' '}
            <Link 
              href="/register" 
              className="font-medium text-accent hover:text-primary-600 underline transition-colors"
            >
              Create now
            </Link>
          </p>
        </div>
      </div>

      {/* Login Form */}
      <LoginForm />
    </div>
  );
}