import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonCardProps {
  size?: 'small' | 'medium' | 'large';
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ size = 'medium' }) => {
  // Size configurations (Netflix-style 16:9 aspect ratio)
  const sizeClasses = {
    small: 'w-40 md:w-48',
    medium: 'w-52 md:w-64',
    large: 'w-64 md:w-80',
  };

  const aspectRatioClass = 'aspect-video';

  return (
    <div className={`${sizeClasses[size]} ${aspectRatioClass} flex-shrink-0`}>
      {/* Thumbnail skeleton */}
      <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 animate-pulse" />
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
        
        {/* Play button placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-white/10 rounded-full" />
        </div>
      </div>
      
      {/* Title skeleton */}
      <div className="mt-2 px-1">
        <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" />
      </div>
    </div>
  );
};

export default SkeletonCard;
