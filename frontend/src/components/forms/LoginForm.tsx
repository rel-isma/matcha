// Login Form Component
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, GoogleSignInButton, Intra42SignInButton } from '../ui';
import { validateLoginForm } from '../../lib/validation';
import { useAuth } from '@/context';

interface LoginFormData {
  username: string;
  password: string;
}

interface LoginFormErrors {
  username?: string;
  password?: string;
  general?: string;
}

const LoginForm = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof LoginFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await login(formData);
      if (result.success) {
        // Check if profile is completed and redirect accordingly
        if (result.data?.user?.isProfileCompleted) {
          router.push('/browse');
        } else {
          router.push('/complete-profile');
        }
      } else {
        // Check if error is related to email verification
        const errorMessage = result.message || 'Login failed';
        const isVerificationError = errorMessage.toLowerCase().includes('verify') || 
                                  errorMessage.toLowerCase().includes('verification') ||
                                  errorMessage.toLowerCase().includes('not verified');
        
        if (isVerificationError) {
          // Redirect to verify-email page with username/email
          router.push(`/verify-email?email=${encodeURIComponent(formData.username)}`);
          return;
        } else {
          setErrors({ general: errorMessage });
        }
      }
    } catch {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg">
            <p className="text-xs sm:text-sm">{errors.general}</p>
          </div>
        )}

        <Input
          label="Username"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
          placeholder="johndoe"
          required
        />

        <div className="relative">
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="@#*%"
            required
          />
          {/* Password toggle button would go here */}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-xs sm:text-sm text-gray-600">
              Remember me
            </label>
          </div>

          <Link 
            href="/forgot-password" 
            className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-medium underline"
          >
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          className="w-full bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 text-sm sm:text-base py-2.5 sm:py-3"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      {/* Social Login */}
      <div className="space-y-3.5 sm:space-y-4">
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="px-3 sm:px-4 text-xs sm:text-sm text-gray-500">OR</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <GoogleSignInButton isLogin={true} />
          <Intra42SignInButton isLogin={true} />
        </div>
      </div>
    </div>
  );
};

export { LoginForm };
