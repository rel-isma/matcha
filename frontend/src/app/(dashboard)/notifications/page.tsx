'use client';

import { Bell } from 'lucide-react';
import React from 'react';

export default function NotificationsPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-800">Notifications</h1>
          <p className="text-secondary-600 mt-2">Stay updated with your latest activities</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4">
            <Bell className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-secondary-800 mb-2">Notifications Content Coming Soon</h2>
          <p className="text-secondary-600">
            We're creating a comprehensive notification system to keep you informed.
          </p>
        </div>
      </div>
    </div>
  );
}
