// Login Form Component
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, GoogleSignInButton } from '../ui';
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
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            <p className="text-sm">{errors.general}</p>
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

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
              Remember me
            </label>
          </div>

          <Link 
            href="/forgot-password" 
            className="text-sm text-primary-600 hover:text-primary-700 font-medium underline"
          >
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          className="w-full bg-primary-600 hover:bg-primary-700 focus:ring-primary-500"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      {/* Social Login */}
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">OR</span>
          </div>
        </div>

        <div className="space-y-3">
          <GoogleSignInButton isLogin={true} />
        </div>
      </div>
    </div>
  );
};

export { LoginForm };
