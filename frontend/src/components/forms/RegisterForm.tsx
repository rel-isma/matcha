// Multi-Step Register Form Component
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, GoogleSignInButton, Intra42SignInButton } from '../ui';
import { validateRegisterForm } from '../../lib/validation';
import { useAuth } from '@/context';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormErrors {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const RegisterForm = () => {
  const { register } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof RegisterFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (step: number) => {
    const newErrors: RegisterFormErrors = {};
    
    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.username.trim()) newErrors.username = 'Username is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    }
    
    if (step === 2) {
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleNext = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    
    setErrors({});
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateRegisterForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await register(formData);
      if (result.success) {
        // Redirect to verification page instead of dashboard
        router.push('/verify');
      } else {
        setErrors({ general: result.message || 'Registration failed' });
      }
    } catch {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Compact Step Indicator */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="text-xs sm:text-sm text-gray-600">
          Step {currentStep} of 2
        </div>
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
            currentStep >= 1 ? 'bg-primary-600' : 'bg-gray-300'
          }`} />
          <div className={`w-5 sm:w-6 h-0.5 transition-colors ${
            currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-300'
          }`} />
          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
            currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-300'
          }`} />
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={currentStep === 2 ? handleSubmit : (e) => e.preventDefault()} className="space-y-3.5 sm:space-y-4">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm">
            {errors.general}
          </div>
        )}

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-3.5 sm:space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <Input
                label="First Name"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                placeholder="John"
                required
              />

              <Input
                label="Last Name"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                placeholder="Doe"
                required
              />
            </div>

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

            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="john@example.com"
              required
            />

            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleNext}
              className="w-full bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 text-sm sm:text-base py-2.5 sm:py-3"
            >
              Continue
            </Button>

            {/* Social Login */}
            <div className="space-y-3.5 sm:space-y-4">
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="px-3 sm:px-4 text-xs sm:text-sm text-gray-500">OR</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <GoogleSignInButton isLogin={false} />
                <Intra42SignInButton isLogin={false} />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Security */}
        {currentStep === 2 && (
          <div className="space-y-3.5 sm:space-y-4">
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Create a secure password"
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
              required
            />

            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleBack}
                className="w-full sm:flex-1 order-2 sm:order-1 text-sm sm:text-base py-2.5 sm:py-3"
              >
                Back
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full sm:flex-1 bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 order-1 sm:order-2 text-sm sm:text-base py-2.5 sm:py-3"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export { RegisterForm };