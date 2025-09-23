// Auth Context
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../lib/api';
import type { User, LoginFormData, RegisterFormData, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = async () => {
    try {
      const result = await authApi.refreshToken();
      if (result.success && result.data) {
        setUser(result.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    // Try to refresh auth on app start
    const initAuth = async () => {
      try {
        await refreshAuth();
      } catch {
        // Ignore errors on init
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginFormData) => {
    try {
      setIsLoading(true);
      
      const result = await authApi.login(credentials);
      if (result.success && result.data) {
        setUser(result.data.user);
        return { success: true };
      } else {
        return { success: false, message: result.message || 'Login failed' };
      }
    } catch {
      return { success: false, message: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterFormData) => {
    try {
      setIsLoading(true);
      
      const result = await authApi.register(userData);
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, message: result.message || 'Registration failed' };
      }
    } catch {
      return { success: false, message: 'Registration failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
    } catch {
      setUser(null); // Still clear user on error
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
