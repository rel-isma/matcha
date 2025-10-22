'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { SlidersHorizontal } from 'lucide-react';

export interface SearchFiltersData {
  minAge?: number;
  maxAge?: number;
  minFame?: number;
  maxFame?: number;
  tags?: string[];
  city?: string;
  sortBy?: 'age' | 'location' | 'fame' | 'tags';
  sortOrder?: 'asc' | 'desc';
}

interface SearchFiltersProps {
  filters: SearchFiltersData;
  onFiltersChange: (filters: SearchFiltersData) => void;
  onReset: () => void;
  onSearch: (filtersToSearch: SearchFiltersData) => void;
  availableInterests?: string[];
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  onSearch,
  availableInterests = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newInterest, setNewInterest] = useState('');
  const [localFilters, setLocalFilters] = useState<SearchFiltersData>(filters);

  const updateLocalFilter = (key: keyof SearchFiltersData, value: string | number | string[] | undefined) => {
    const newFilters = {
      ...localFilters,
      [key]: value
    };
    setLocalFilters(newFilters);

    // Apply sorting immediately like browse page
    if (key === 'sortBy' || key === 'sortOrder') {
      onFiltersChange(newFilters);
    }
  };

  const applyFilters = () => {
    // Only search if there are actual filters set
    const hasFilters = Boolean(
      localFilters.minAge || localFilters.maxAge || localFilters.minFame || 
      localFilters.maxFame || localFilters.city || localFilters.tags?.length
    );
    
    if (hasFilters) {
      // Update filters and search with current local filters
      onFiltersChange(localFilters);
      onSearch(localFilters);
      // Auto-collapse the filter panel after applying
      setIsExpanded(false);
    }
  };

  // Check if there are any active filters
  const hasActiveFilters = Boolean(
    localFilters.minAge || localFilters.maxAge || localFilters.minFame || 
    localFilters.maxFame || localFilters.city || localFilters.tags?.length
  );

  const resetFilters = () => {
    const defaultFilters = {
      sortBy: 'fame' as const,
      sortOrder: 'desc' as const
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
    onReset();
  };

  const addInterest = (interest: string) => {
    const normalizedInterest = interest.toLowerCase().trim();
    if (normalizedInterest && !localFilters.tags?.includes(normalizedInterest)) {
      updateLocalFilter('tags', [...(localFilters.tags || []), normalizedInterest]);
    }
    setNewInterest('');
  };

  const removeInterest = (interest: string) => {
    updateLocalFilter('tags', localFilters.tags?.filter(i => i !== interest) || []);
  };

  const sortOptions = [
    { value: 'age', label: 'Age' },
    { value: 'location', label: 'Location' },
    { value: 'fame', label: 'Fame Rating' },
    { value: 'tags', label: 'Interest Tags' }
  ];

  const sortOrderOptions = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-md border border-orange-100 relative z-10">
      {/* Header with Sort Controls - Always Visible */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-3 border-b border-orange-100">
        {/* Title and Filter Button */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Advanced Search
          </h2>
          
          <div className="flex items-center gap-2">
            {/* Active filters indicator */}
            {hasActiveFilters && (
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            )}
            
            {/* Filter Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg transition-all duration-200 shadow-md font-medium text-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {isExpanded ? 'Hide Filters' : 'Filters'}
            </button>
          </div>
        </div>

        {/* Sort Controls - Always Visible */}
        <div className="space-y-1.5 relative">
          <h3 className="text-xs font-semibold text-orange-800">Sort & Order</h3>
          <div className="grid grid-cols-2 gap-2">
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
        <div className="p-3 bg-gradient-to-b from-orange-25 to-white">
          <div className="space-y-3">

            {/* Age Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-orange-800">Age Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min age"
                  value={localFilters.minAge || ''}
                  onChange={(e) => updateLocalFilter('minAge', e.target.value ? parseInt(e.target.value) : undefined)}
                  min={18}
                  max={100}
                  className="text-sm rounded-lg bg-white border-orange-200 focus:border-orange-400 focus:ring-orange-400 placeholder-gray-400"
                />
                <Input
                  type="number"
                  placeholder="Max age"
                  value={localFilters.maxAge || ''}
                  onChange={(e) => updateLocalFilter('maxAge', e.target.value ? parseInt(e.target.value) : undefined)}
                  min={18}
                  max={100}
                  className="text-sm rounded-lg bg-white border-orange-200 focus:border-orange-400 focus:ring-orange-400 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Location Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-orange-800">Location (City)</label>
              <Input
                type="text"
                placeholder="Enter city name..."
                value={localFilters.city || ''}
                onChange={(e) => updateLocalFilter('city', e.target.value || undefined)}
                className="text-sm rounded-lg bg-white border-orange-200 focus:border-orange-400 focus:ring-orange-400 placeholder-gray-400"
              />
            </div>

            {/* Fame Rating Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-orange-800">Fame Rating Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min fame"
                  value={localFilters.minFame || ''}
                  onChange={(e) => updateLocalFilter('minFame', e.target.value ? parseInt(e.target.value) : undefined)}
                  min={0}
                  max={100}
                  className="text-sm rounded-lg bg-white border-orange-200 focus:border-orange-400 focus:ring-orange-400 placeholder-gray-400"
                />
                <Input
                  type="number"
                  placeholder="Max fame"
                  value={localFilters.maxFame || ''}
                  onChange={(e) => updateLocalFilter('maxFame', e.target.value ? parseInt(e.target.value) : undefined)}
                  min={0}
                  max={100}
                  className="text-sm rounded-lg bg-white border-orange-200 focus:border-orange-400 focus:ring-orange-400 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Interest Tags Filter */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-orange-800">Interest Tags</label>
              
              {/* Add interest */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Add interest tag..."
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addInterest(newInterest);
                    }
                  }}
                  className="flex-1 text-sm rounded-lg bg-white border-orange-200 focus:border-orange-400 focus:ring-orange-400 placeholder-gray-400"
                />
                <Button
                  onClick={() => addInterest(newInterest)}
                  disabled={!newInterest}
                  className="px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium text-sm rounded-lg disabled:opacity-50 shadow-md"
                >
                  Add
                </Button>
              </div>

              {/* Popular interests */}
              {availableInterests.length > 0 && (
                <div>
                  <p className="text-xs text-orange-600 font-medium mb-1.5">Popular interests:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {availableInterests.slice(0, 8).map((interest) => (
                      <button
                        key={interest}
                        onClick={() => addInterest(interest)}
                        disabled={localFilters.tags?.includes(interest.toLowerCase())}
                        className="px-2.5 py-1 text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-orange-200"
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected interests */}
              {localFilters.tags && localFilters.tags.length > 0 && (
                <div>
                  <p className="text-xs text-orange-600 font-medium mb-1.5">Selected interests:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {localFilters.tags.map((interest) => (
                      <div
                        key={interest}
                        className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 rounded-full text-xs border border-orange-200"
                      >
                        <span>{interest}</span>
                        <button
                          onClick={() => removeInterest(interest)}
                          className="text-orange-600 hover:text-orange-800 font-bold ml-0.5"
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
            <div className="flex gap-2 pt-3 border-t border-orange-100">
              <Button
                onClick={resetFilters}
                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200 border border-gray-200 text-sm"
              >
                Reset All
              </Button>
              <Button
                onClick={applyFilters}
                disabled={!hasActiveFilters}
                className={`flex-1 px-3 py-2 font-semibold rounded-lg transition-all duration-200 shadow-lg text-sm ${
                  hasActiveFilters 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white cursor-pointer' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {hasActiveFilters ? 'Apply Search' : 'Set Filters First'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};