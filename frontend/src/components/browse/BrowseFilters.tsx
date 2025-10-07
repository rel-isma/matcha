'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

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
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-cream-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <h2 className="text-lg md:text-xl font-bold text-secondary-800 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
          Discover & Filter
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-2 text-xs md:text-sm font-medium text-secondary-700 bg-cream-100 hover:bg-cream-200 rounded-xl transition-colors"
          >
            {isExpanded ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button
            onClick={resetFilters}
            className="px-3 py-2 text-xs md:text-sm font-medium text-secondary-600 border border-secondary-300 hover:bg-secondary-50 rounded-xl transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <Select
          label="Sort by"
          value={filters.sortBy || ''}
          onChange={(value) => updateLocalFilter('sortBy', value)}
          options={sortOptions}
          placeholder="Choose sorting"
          className="text-sm"
        />
        <Select
          label="Sort order"
          value={filters.sortOrder || ''}
          onChange={(value) => updateLocalFilter('sortOrder', value)}
          options={sortOrderOptions}
          placeholder="Choose order"
          className="text-sm"
        />
      </div>

      {isExpanded && (
        <div className="border-t border-cream-300 pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-secondary-700">Age Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={localFilters.minAge || ''}
                  onChange={(e) => updateLocalFilter('minAge', e.target.value ? parseInt(e.target.value) : undefined)}
                  min={18}
                  max={100}
                  className="text-sm rounded-xl"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={localFilters.maxAge || ''}
                  onChange={(e) => updateLocalFilter('maxAge', e.target.value ? parseInt(e.target.value) : undefined)}
                  min={18}
                  max={100}
                  className="text-sm rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-secondary-700">Max Distance</label>
              <Input
                type="number"
                placeholder="km"
                value={localFilters.maxDistance || ''}
                onChange={(e) => updateLocalFilter('maxDistance', e.target.value ? parseInt(e.target.value) : undefined)}
                min={1}
                max={1000}
                className="text-sm rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-secondary-700">Fame Rating</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={localFilters.fameMin || ''}
                  onChange={(e) => updateLocalFilter('fameMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                  min={0}
                  max={5}
                  step={0.1}
                  className="text-sm rounded-xl"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={localFilters.fameMax || ''}
                  onChange={(e) => updateLocalFilter('fameMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                  min={0}
                  max={5}
                  step={0.1}
                  className="text-sm rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-secondary-700">Interests</label>
            
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
                className="flex-1 text-sm rounded-xl"
              />
              <Button
                onClick={() => addInterest(newInterest)}
                disabled={!newInterest}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm rounded-xl disabled:opacity-50"
              >
                Add
              </Button>
            </div>

            {availableInterests.length > 0 && (
              <div>
                <p className="text-xs text-secondary-600 mb-2">Popular interests:</p>
                <div className="flex flex-wrap gap-2">
                  {availableInterests.slice(0, 8).map((interest) => (
                    <button
                      key={interest}
                      onClick={() => addInterest(interest)}
                      disabled={localFilters.interests?.includes(interest)}
                      className="px-3 py-1 text-xs bg-cream-100 hover:bg-cream-200 text-secondary-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {localFilters.interests && localFilters.interests.length > 0 && (
              <div>
                <p className="text-xs text-secondary-600 mb-2">Selected interests:</p>
                <div className="flex flex-wrap gap-2">
                  {localFilters.interests.map((interest) => (
                    <div
                      key={interest}
                      className="flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs"
                    >
                      <span>{interest}</span>
                      <button
                        onClick={() => removeInterest(interest)}
                        className="text-primary-600 hover:text-primary-800 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center pt-4 border-t border-cream-200">
            <Button
              onClick={applyFilters}
              className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
