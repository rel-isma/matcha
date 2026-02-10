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
    <div className="bg-card rounded-2xl shadow-lg border-2 border-border relative z-10">
      {/* Header with Sort Controls - Always Visible */}
      <div className={`bg-card p-4 border-b border-border ${isExpanded ? 'rounded-t-2xl' : 'rounded-2xl'}`}>
        {/* Title and Filter Button */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground">
            Browse Profiles
          </h2>
          
          <div className="flex items-center gap-2">
            {/* Active filters indicator */}
            {(localFilters.minAge || localFilters.maxAge || localFilters.maxDistance || localFilters.interests?.length) && (
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            )}
            
            {/* Filter Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-primary-600 text-white rounded-xl transition-all duration-200 shadow-md font-medium text-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {isExpanded ? 'Hide Filters' : 'Filters'}
            </button>
          </div>
        </div>

        {/* Sort Controls - Always Visible */}
        <div className="space-y-2 relative">
          <h3 className="text-sm font-semibold text-foreground">Sort & Order</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative z-50">
              <Select
                label=""
                value={filters.sortBy || ''}
                onChange={(value) => updateLocalFilter('sortBy', value)}
                options={sortOptions}
                placeholder="Sort by..."
                className="text-sm bg-input border-border focus:border-ring focus:ring-ring"
              />
            </div>
            <div className="relative z-40">
              <Select
                label=""
                value={filters.sortOrder || ''}
                onChange={(value) => updateLocalFilter('sortOrder', value)}
                options={sortOrderOptions}
                placeholder="Order..."
                className="text-sm bg-input border-border focus:border-ring focus:ring-ring"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Filter Menu */}
      {isExpanded && (
        <div className="p-4 bg-card rounded-b-2xl">
          <div className="space-y-4">

            {/* Age Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Age Range</label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="Min age"
                  value={localFilters.minAge || ''}
                  onChange={(e) => updateLocalFilter('minAge', e.target.value ? parseInt(e.target.value) : undefined)}
                  min={18}
                  max={100}
                  className="text-sm rounded-xl bg-input border-border focus:border-ring focus:ring-ring placeholder-muted-foreground"
                />
                <Input
                  type="number"
                  placeholder="Max age"
                  value={localFilters.maxAge || ''}
                  onChange={(e) => updateLocalFilter('maxAge', e.target.value ? parseInt(e.target.value) : undefined)}
                  min={18}
                  max={100}
                  className="text-sm rounded-xl bg-input border-border focus:border-ring focus:ring-ring placeholder-muted-foreground"
                />
              </div>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Max Distance (km)</label>
              <Input
                type="number"
                placeholder="Distance in kilometers"
                value={localFilters.maxDistance || ''}
                onChange={(e) => updateLocalFilter('maxDistance', e.target.value ? parseInt(e.target.value) : undefined)}
                min={1}
                max={1000}
                className="text-sm rounded-xl bg-input border-border focus:border-ring focus:ring-ring placeholder-muted-foreground"
              />
            </div>

            {/* Fame Rating Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Fame Rating</label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="Min rating"
                  value={localFilters.fameMin || ''}
                  onChange={(e) => updateLocalFilter('fameMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                  min={0}
                  max={5}
                  step={0.1}
                  className="text-sm rounded-xl bg-input border-border focus:border-ring focus:ring-ring placeholder-muted-foreground"
                />
                <Input
                  type="number"
                  placeholder="Max rating"
                  value={localFilters.fameMax || ''}
                  onChange={(e) => updateLocalFilter('fameMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                  min={0}
                  max={5}
                  step={0.1}
                  className="text-sm rounded-xl bg-input border-border focus:border-ring focus:ring-ring placeholder-muted-foreground"
                />
              </div>
            </div>

            {/* Common Tags Filter */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground">Common Tags (Interests)</label>
              
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
                  className="flex-1 text-sm rounded-xl bg-input border-border focus:border-ring focus:ring-ring placeholder-muted-foreground"
                />
                <Button
                  onClick={() => addInterest(newInterest)}
                  disabled={!newInterest}
                  className="px-4 py-2 bg-accent hover:bg-primary-600 text-white font-medium text-sm rounded-xl disabled:opacity-50 shadow-md"
                >
                  Add
                </Button>
              </div>

              {/* Popular interests */}
              {availableInterests.length > 0 && (
                <div>
                  <p className="text-xs text-accent font-medium mb-2">Popular interests:</p>
                  <div className="flex flex-wrap gap-2">
                    {availableInterests.slice(0, 6).map((interest) => (
                      <button
                        key={interest}
                        onClick={() => addInterest(interest)}
                        disabled={localFilters.interests?.includes(interest)}
                        className="px-3 py-1.5 text-xs bg-input hover:bg-muted text-foreground rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-border"
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
                  <p className="text-xs text-accent font-medium mb-2">Selected interests:</p>
                  <div className="flex flex-wrap gap-2">
                    {localFilters.interests.map((interest) => (
                      <div
                        key={interest}
                        className="flex items-center gap-1 px-3 py-1.5 bg-accent/20 text-accent rounded-full text-xs border border-accent"
                      >
                        <span>{interest}</span>
                        <button
                          onClick={() => removeInterest(interest)}
                          className="text-accent hover:text-primary-600 font-bold ml-1"
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
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                onClick={resetFilters}
                className="flex-1 px-4 py-3 bg-muted hover:bg-secondary-500 text-foreground font-medium rounded-xl transition-all duration-200 border border-border"
              >
                Reset
              </Button>
              <Button
                onClick={applyFilters}
                className="flex-1 px-4 py-3 bg-accent hover:bg-primary-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg"
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
