import React from 'react';
import { motion } from 'framer-motion';
import VideoCard from './VideoCard';
import SkeletonCard from './SkeletonCard';

interface Video {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  videoUrl?: string;
  streamingUrl?: string;
  category?: string;
  tags?: string[];
  duration?: number;
  views?: number;
  likes?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CarouselRowProps {
  title: string;
  videos: Video[];
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  isAdmin?: boolean;
  onDeleteVideo?: (videoId: string) => void;
}

const CarouselRow: React.FC<CarouselRowProps> = ({
  title,
  videos,
  loading = false,
  size = 'medium',
  isAdmin = false,
  onDeleteVideo,
}) => {

  const renderSkeletons = () => {
    const skeletonCount = 8;

    return Array.from({ length: skeletonCount }).map((_, index) => (
      <SkeletonCard key={`skeleton-${index}`} size={size} />
    ));
  };

  return (
    <div className="relative py-8">
      {/* Title */}
      <h2 className="px-4 md:px-8 lg:px-16 text-xl md:text-2xl font-black tracking-tight text-white mb-6 uppercase">
        {title}
      </h2>

      {/* Responsive Grid Container */}
      <div className="px-4 md:px-8 lg:px-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
          {loading ? (
            renderSkeletons()
          ) : (
            videos.map((video, index) => (
              <motion.div
                key={video._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <VideoCard 
                  video={video} 
                  size={size} 
                  isAdmin={isAdmin} 
                  onDelete={onDeleteVideo} 
                  showVideoPreview={true}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CarouselRow;
