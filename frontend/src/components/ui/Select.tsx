// Custom Select Component with Search and Mobile Support
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  searchable?: boolean;
  multiSelect?: boolean;
  className?: string;
  maxHeight?: number;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  label,
  error,
  disabled = false,
  searchable = false,
  multiSelect = false,
  className = '',
  maxHeight = 200,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search query
  const filteredOptions = searchQuery
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Handle option selection
  const handleOptionClick = (optionValue: string) => {
    if (multiSelect) {
      const currentValue = Array.isArray(value) ? value : [];
      if (currentValue.includes(optionValue)) {
        onChange(currentValue.filter((v) => v !== optionValue));
      } else {
        onChange([...currentValue, optionValue]);
      }
    } else {
      onChange(optionValue);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  // Remove selected option (for multi-select)
  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (Array.isArray(value)) {
      onChange(value.filter((v) => v !== optionValue));
    }
  };

  // Get display text
  const getDisplayText = () => {
    if (!value) return placeholder;
    
    if (multiSelect && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      if (value.length === 1) {
        const option = options.find((opt) => opt.value === value[0]);
        return option?.label || placeholder;
      }
      return `${value.length} selected`;
    }
    
    const option = options.find((opt) => opt.value === value);
    return option?.label || placeholder;
  };

  // Check if option is selected
  const isSelected = (optionValue: string) => {
    if (multiSelect && Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          relative w-full bg-white border rounded-lg px-4 py-3
          text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500
          focus:border-orange-500 transition-all duration-200 shadow-sm hover:shadow-md
          ${error 
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 hover:border-orange-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
          ${isOpen ? 'ring-2 ring-orange-500 border-orange-500 shadow-md' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {/* Selected values display */}
            {multiSelect && Array.isArray(value) && value.length > 1 ? (
              <div className="flex flex-wrap gap-2">
                {value.slice(0, 3).map((selectedValue) => {
                  const option = options.find((opt) => opt.value === selectedValue);
                  return (
                    <span
                      key={selectedValue}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-200"
                    >
                      {option?.label}
                      <button
                        onClick={(e) => removeOption(selectedValue, e)}
                        className="ml-2 hover:text-orange-600 transition-colors duration-150"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}
                {value.length > 3 && (
                  <span className="text-sm text-gray-500 font-medium">
                    +{value.length - 3} more
                  </span>
                )}
              </div>
            ) : (
              <span className={`block truncate font-medium ${!value ? 'text-gray-500' : 'text-gray-900'}`}>
                {getDisplayText()}
              </span>
            )}
          </div>
          
          {/* Dropdown arrow */}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-3 flex-shrink-0"
          >
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </motion.div>
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5"
          >
            {/* Search input */}
            {searchable && (
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search options..."
                    className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* Options list */}
            <div
              className="py-1 overflow-auto"
              style={{ maxHeight: `${maxHeight}px` }}
            >
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  <Search className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionClick(option.value)}
                    className={`
                      w-full text-left px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50
                      focus:outline-none focus:bg-gradient-to-r focus:from-orange-50 focus:to-amber-50
                      flex items-center justify-between transition-all duration-200 font-medium
                      ${index === 0 ? 'rounded-t-xl' : ''}
                      ${index === filteredOptions.length - 1 ? 'rounded-b-xl' : ''}
                      ${isSelected(option.value) 
                        ? 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-900 border-l-4 border-orange-500' 
                        : 'text-gray-700 hover:text-orange-800'
                      }
                    `}
                  >
                    <span className="flex-1">{option.label}</span>
                    {isSelected(option.value) && (
                      <Check className="h-4 w-4 text-orange-600 ml-2" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-600"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};
