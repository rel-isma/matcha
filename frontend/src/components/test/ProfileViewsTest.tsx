/**
 * Profile Views Frontend Test Component
 * Test the profile views functionality in the frontend
 */

'use client';

import React, { useState } from 'react';
import { profileApi } from '@/lib/profileApi';
import { Button } from '@/components/ui/Button';
import { ProfileView } from '@/types';

export default function ProfileViewsTest() {
  const [views, setViews] = useState<ProfileView[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const testGetProfileViews = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await profileApi.getProfileViews(1, 10);
      
      if (response.success && response.data) {
        setViews(response.data.views);
        setSuccess(`Successfully fetched ${response.data.views.length} views (total: ${response.data.total})`);
      } else {
        setError(response.message || 'Failed to fetch profile views');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Views Test</h2>
      
      <div className="space-y-4">
        <Button 
          onClick={testGetProfileViews}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600"
        >
          {loading ? 'Testing...' : 'Test Get Profile Views'}
        </Button>
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-medium">Error: {error}</p>
          </div>
        )}
        
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 font-medium">Success: {success}</p>
          </div>
        )}
        
        {views.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Views:</h3>
            <div className="space-y-3">
              {views.map((view) => (
                <div key={view.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      {view.viewer ? (
                        <>
                          <p className="font-medium text-gray-900">
                            {view.viewer.firstName} {view.viewer.lastName}
                          </p>
                          <p className="text-sm text-gray-600">@{view.viewer.username}</p>
                        </>
                      ) : (
                        <p className="font-medium text-gray-500">Anonymous Viewer</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(view.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {view.viewer?.profilePicture && (
                      <img
                        src={view.viewer.profilePicture}
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}