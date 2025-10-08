'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { SlidersHorizontal } from 'lucide-react';


export interface BrowseFiltersData {
  minAge?: number;
  maxAge?: number;
  maxDistance?: number;
  fameMin?: number;
  fameMax?: number;
  interests?: string[];
  sortBy?: 'age' | 'location' | 'fame_rating' | 'common_tags';
  sortOrder?: 'asc' | 'desc';
}

interface BrowseFiltersProps {
  filters: BrowseFiltersData;
  onFiltersChange: (filters: BrowseFiltersData) => void;
  onReset: () => void;
  availableInterests?: string[];
}

export const BrowseFilters: React.FC<BrowseFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  availableInterests = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newInterest, setNewInterest] = useState('');
  const [localFilters, setLocalFilters] = useState<BrowseFiltersData>(filters);

  const updateLocalFilter = (key: keyof BrowseFiltersData, value: string | number | string[] | undefined) => {
    const newFilters = {
      ...localFilters,
      [key]: value
    };
    setLocalFilters(newFilters);

    if (key === 'sortBy' || key === 'sortOrder') {
      onFiltersChange(newFilters);
    }
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      sortBy: 'common_tags' as const,
      sortOrder: 'desc' as const
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
    onReset();
  };

  const addInterest = (interest: string) => {
    if (interest && !localFilters.interests?.includes(interest)) {
      updateLocalFilter('interests', [...(localFilters.interests || []), interest]);
    }
    setNewInterest('');
  };

  const removeInterest = (interest: string) => {
    updateLocalFilter('interests', localFilters.interests?.filter(i => i !== interest) || []);
  };

  const sortOptions = [
    { value: 'age', label: 'Age' },
    { value: 'location', label: 'Distance' },
    { value: 'fame_rating', label: 'Fame Rating' },
    { value: 'common_tags', label: 'Common Interests' }
  ];

  const sortOrderOptions = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-orange-100 relative z-10">
      {/* Header with Sort Controls - Always Visible */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 border-b border-orange-100">
        {/* Title and Filter Button */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Browse Profiles
          </h2>
          
          <div className="flex items-center gap-2">
            {/* Active filters indicator */}
            {(localFilters.minAge || localFilters.maxAge || localFilters.maxDistance || localFilters.interests?.length) && (
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            )}
            
            {/* Filter Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl transition-all duration-200 shadow-md font-medium text-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {isExpanded ? 'Hide Filters' : 'Filters'}
            </button>
          </div>
        </div>

        {/* Sort Controls - Always Visible */}
        <div className="space-y-2 relative">
          <h3 className="text-sm font-semibold text-orange-800">Sort & Order</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative z-50">
              <Select
                label=""
                value={filters.sortBy || ''}
                onChange={(value) => updateLocalFilter('sortBy', value)}
                options={sortOptions}
                placeholder="Sort by..."
                className="text-sm bg-white border-orange-200 focus:border-orange-400 focus:ring-orange-400"
              />
            </div>
            <div className="relative z-40">
              <Select
                label=""
                value={filters.sortOrder || ''}
                onChange={(value) => updateLocalFilter('sortOrder', value)}
                options={sortOrderOptions}
                placeholder="Order..."
                className="text-sm bg-white border-orange-200 focus:border-orange-400 focus:ring-orange-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Filter Menu */}
      {isExpanded && (
        <div className="p-4 bg-gradient-to-b from-orange-25 to-white">
          <div className="space-y-4">

            {/* Age Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-orange-800">Age Range</label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="Min age"
                  value={localFilters.minAge || ''}
                  onChange={(e) => updateLocalFilter('minAge', e.target.value ? parseInt(e.target.value) : undefined)}
                  min={18}
                  max={100}
                  className="text-sm rounded-xl bg-white border-orange-200 focus:border-orange-400 focus:ring-orange-400 placeholder-gray-400"
                />
                <Input
                  type="number"
                  placeholder="Max age"
                  value={localFilters.maxAge || ''}
                  onChange={(e) => updateLocalFilter('maxAge', e.target.value ? parseInt(e.target.value) : undefined)}
                  min={18}
                  max={100}
                  className="text-sm rounded-xl bg-white border-orange-200 focus:border-orange-400 focus:ring-orange-400 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-orange-800">Max Distance (km)</label>
              <Input
                type="number"
                placeholder="Distance in kilometers"
                value={localFilters.maxDistance || ''}
                onChange={(e) => updateLocalFilter('maxDistance', e.target.value ? parseInt(e.target.value) : undefined)}
                min={1}
                max={1000}
                className="text-sm rounded-xl bg-white border-orange-200 focus:border-orange-400 focus:ring-orange-400 placeholder-gray-400"
              />
            </div>

            {/* Fame Rating Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-orange-800">Fame Rating</label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="Min rating"
                  value={localFilters.fameMin || ''}
                  onChange={(e) => updateLocalFilter('fameMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                  min={0}
                  max={5}
                  step={0.1}
                  className="text-sm rounded-xl bg-white border-orange-200 focus:border-orange-400 focus:ring-orange-400 placeholder-gray-400"
                />
                <Input
                  type="number"
                  placeholder="Max rating"
                  value={localFilters.fameMax || ''}
                  onChange={(e) => updateLocalFilter('fameMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                  min={0}
                  max={5}
                  step={0.1}
                  className="text-sm rounded-xl bg-white border-orange-200 focus:border-orange-400 focus:ring-orange-400 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Common Tags Filter */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-orange-800">Common Tags (Interests)</label>
              
              {/* Add interest */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Add interest..."
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addInterest(newInterest);
                    }
                  }}
                  className="flex-1 text-sm rounded-xl bg-white border-orange-200 focus:border-orange-400 focus:ring-orange-400 placeholder-gray-400"
                />
                <Button
                  onClick={() => addInterest(newInterest)}
                  disabled={!newInterest}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium text-sm rounded-xl disabled:opacity-50 shadow-md"
                >
                  Add
                </Button>
              </div>

              {/* Popular interests */}
              {availableInterests.length > 0 && (
                <div>
                  <p className="text-xs text-orange-600 font-medium mb-2">Popular interests:</p>
                  <div className="flex flex-wrap gap-2">
                    {availableInterests.slice(0, 6).map((interest) => (
                      <button
                        key={interest}
                        onClick={() => addInterest(interest)}
                        disabled={localFilters.interests?.includes(interest)}
                        className="px-3 py-1.5 text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-orange-200"
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected interests */}
              {localFilters.interests && localFilters.interests.length > 0 && (
                <div>
                  <p className="text-xs text-orange-600 font-medium mb-2">Selected interests:</p>
                  <div className="flex flex-wrap gap-2">
                    {localFilters.interests.map((interest) => (
                      <div
                        key={interest}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 rounded-full text-xs border border-orange-200"
                      >
                        <span>{interest}</span>
                        <button
                          onClick={() => removeInterest(interest)}
                          className="text-orange-600 hover:text-orange-800 font-bold ml-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4 border-t border-orange-100">
              <Button
                onClick={resetFilters}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200 border border-gray-200"
              >
                Reset
              </Button>
              <Button
                onClick={applyFilters}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
