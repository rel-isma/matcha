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
    setIsExpanded(false);
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
    <div className="bg-card rounded-xl shadow-md border-2 border-border relative z-10">
      {/* Header with Sort Controls - Always Visible */}
      <div className={`bg-card p-3 border-b border-border ${isExpanded ? 'rounded-t-xl' : 'rounded-xl'}`}>
        {/* Title and Filter Button */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold text-foreground">
            Advanced Search
          </h2>
          
          <div className="flex items-center gap-2">
            {/* Active filters indicator */}
            {hasActiveFilters && (
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            )}
            
            {/* Filter Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 px-3 py-1.5 bg-accent hover:bg-primary-600 text-white rounded-lg transition-all duration-200 shadow-md font-medium text-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {isExpanded ? 'Hide Filters' : 'Filters'}
            </button>
          </div>
        </div>

        {/* Sort Controls - Always Visible */}
        <div className="space-y-1.5 relative">
          <h3 className="text-xs font-semibold text-foreground">Sort & Order</h3>
          <div className="grid grid-cols-2 gap-2">
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
        <div className="p-3 bg-card rounded-b-xl">
          <div className="space-y-3">

            {/* Age Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">Age Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min age"
                  value={localFilters.minAge || ''}
                  onChange={(e) => updateLocalFilter('minAge', e.target.value ? parseInt(e.target.value) : undefined)}
                  min={18}
                  max={100}
                  className="text-sm rounded-lg bg-input border-border focus:border-ring focus:ring-ring placeholder-muted-foreground"
                />
                <Input
                  type="number"
                  placeholder="Max age"
                  value={localFilters.maxAge || ''}
                  onChange={(e) => updateLocalFilter('maxAge', e.target.value ? parseInt(e.target.value) : undefined)}
                  min={18}
                  max={100}
                  className="text-sm rounded-lg bg-input border-border focus:border-ring focus:ring-ring placeholder-muted-foreground"
                />
              </div>
            </div>

            {/* Location Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">Location (City)</label>
              <Input
                type="text"
                placeholder="Enter city name..."
                value={localFilters.city || ''}
                onChange={(e) => updateLocalFilter('city', e.target.value || undefined)}
                className="text-sm rounded-lg bg-input border-border focus:border-ring focus:ring-ring placeholder-muted-foreground"
              />
            </div>

            {/* Fame Rating Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">Fame Rating Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min fame"
                  value={localFilters.minFame || ''}
                  onChange={(e) => updateLocalFilter('minFame', e.target.value ? parseInt(e.target.value) : undefined)}
                  min={0}
                  max={100}
                  className="text-sm rounded-lg bg-input border-border focus:border-ring focus:ring-ring placeholder-muted-foreground"
                />
                <Input
                  type="number"
                  placeholder="Max fame"
                  value={localFilters.maxFame || ''}
                  onChange={(e) => updateLocalFilter('maxFame', e.target.value ? parseInt(e.target.value) : undefined)}
                  min={0}
                  max={100}
                  className="text-sm rounded-lg bg-input border-border focus:border-ring focus:ring-ring placeholder-muted-foreground"
                />
              </div>
            </div>

            {/* Interest Tags Filter */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-foreground">Interest Tags</label>
              
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
                  className="flex-1 text-sm rounded-lg bg-input border-border focus:border-ring focus:ring-ring placeholder-muted-foreground"
                />
                <Button
                  onClick={() => addInterest(newInterest)}
                  disabled={!newInterest}
                  className="px-3 py-2 bg-accent hover:bg-primary-600 text-white font-medium text-sm rounded-lg disabled:opacity-50 shadow-md"
                >
                  Add
                </Button>
              </div>

              {/* Popular interests */}
              {availableInterests.length > 0 && (
                <div>
                  <p className="text-xs text-accent font-medium mb-1.5">Popular interests:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {availableInterests.slice(0, 8).map((interest) => (
                      <button
                        key={interest}
                        onClick={() => addInterest(interest)}
                        disabled={localFilters.tags?.includes(interest.toLowerCase())}
                        className="px-2.5 py-1 text-xs bg-input hover:bg-muted text-foreground rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-border"
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
                  <p className="text-xs text-accent font-medium mb-1.5">Selected interests:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {localFilters.tags.map((interest) => (
                      <div
                        key={interest}
                        className="flex items-center gap-1 px-2.5 py-1 bg-accent/20 text-accent rounded-full text-xs border border-accent"
                      >
                        <span>{interest}</span>
                        <button
                          onClick={() => removeInterest(interest)}
                          className="text-accent hover:text-primary-600 font-bold ml-0.5"
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
            <div className="flex gap-2 pt-3 border-t border-border">
              <Button
                onClick={resetFilters}
                className="flex-1 px-3 py-2 bg-muted hover:bg-secondary-500 text-foreground font-medium rounded-lg transition-all duration-200 border border-border text-sm"
              >
                Reset All
              </Button>
              <Button
                onClick={applyFilters}
                disabled={!hasActiveFilters}
                className={`flex-1 px-3 py-2 font-semibold rounded-lg transition-all duration-200 shadow-lg text-sm ${
                  hasActiveFilters 
                    ? 'bg-accent hover:bg-primary-600 text-white cursor-pointer' 
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
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