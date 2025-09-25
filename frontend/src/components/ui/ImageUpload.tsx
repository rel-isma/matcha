// Image Upload Component with Preview
'use client';

import React, { useState } from 'react';
import { Upload, X, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploadProps {
  onFileSelect: (files: File[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
  existingImages?: Array<{ id: string; url: string; }>;
  onRemoveExisting?: (id: string) => void;
  className?: string;
  multiple?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onFileSelect,
  maxFiles = 5,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  existingImages = [],
  onRemoveExisting,
  className = '',
  multiple = true,
}) => {
  const [previews, setPreviews] = useState<Array<{ file: File; url: string }>>([]);
  const [dragActive, setDragActive] = useState(false);

  const validateFiles = (files: FileList | File[]): File[] => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];

    fileArray.forEach(file => {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name} is not a supported image format`);
        return;
      }
      
      // Check file size
      if (file.size > maxFileSize) {
        alert(`${file.name} is too large (max ${Math.round(maxFileSize / 1024 / 1024)}MB)`);
        return;
      }

      validFiles.push(file);
    });

    // Check total files limit
    const totalFiles = existingImages.length + previews.length + validFiles.length;
    if (totalFiles > maxFiles) {
      alert(`You can only upload ${maxFiles} images maximum`);
      return validFiles.slice(0, maxFiles - existingImages.length - previews.length);
    }

    return validFiles;
  };

  const handleFileSelect = (files: FileList | File[]) => {
    const validFiles = validateFiles(files);
    
    if (validFiles.length > 0) {
      const newPreviews = validFiles.map(file => ({
        file,
        url: URL.createObjectURL(file)
      }));

      setPreviews(prev => [...prev, ...newPreviews]);
      onFileSelect(validFiles);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    // Clear input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removePreview = (index: number) => {
    setPreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // Clean up object URL to prevent memory leaks
      URL.revokeObjectURL(prev[index].url);
      return newPreviews;
    });
  };

  const canUploadMore = existingImages.length + previews.length < maxFiles;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {canUploadMore && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-all duration-200 hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/10
            ${dragActive 
              ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20' 
              : 'border-gray-300 dark:border-gray-600'
            }
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('image-upload')?.click()}
        >
          <input
            id="image-upload"
            type="file"
            multiple={multiple}
            accept={allowedTypes.join(',')}
            onChange={handleInputChange}
            className="hidden"
          />
          
          <div className="flex flex-col items-center">
            <div className={`p-3 rounded-full mb-4 ${dragActive ? 'bg-pink-100 dark:bg-pink-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
              <Upload className={`h-8 w-8 ${dragActive ? 'text-pink-500' : 'text-gray-400'}`} />
            </div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              {dragActive ? 'Drop your images here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} up to {Math.round(maxFileSize / 1024 / 1024)}MB each
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {existingImages.length + previews.length}/{maxFiles} images uploaded
            </p>
          </div>
        </div>
      )}

      {/* Image Previews Grid */}
      {(existingImages.length > 0 || previews.length > 0) && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Uploaded Images ({existingImages.length + previews.length}/{maxFiles})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* Existing Images */}
            <AnimatePresence>
              {existingImages.map((image, index) => (
                <motion.div
                  key={`existing-${image.id}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group aspect-square"
                >
                  <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                      src={image.url}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {onRemoveExisting && (
                    <button
                      onClick={() => onRemoveExisting(image.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                  
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      Main
                    </div>
                  )}
                </motion.div>
              ))}
              
              {/* New Image Previews */}
              {previews.map((preview, index) => (
                <motion.div
                  key={`preview-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group aspect-square"
                >
                  <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                      src={preview.url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <button
                    onClick={() => removePreview(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                  
                  {/* New indicator */}
                  <div className="absolute bottom-2 left-2 bg-green-500/80 text-white text-xs px-2 py-1 rounded">
                    New
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};
