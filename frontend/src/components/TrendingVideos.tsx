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

interface TrendingVideosProps {
  videos: Video[];
  loading?: boolean;
  isAdmin?: boolean;
  onDeleteVideo?: (videoId: string) => void;
  maxItems?: number;
}

const TrendingVideos: React.FC<TrendingVideosProps> = ({
  videos,
  loading = false,
  isAdmin = false,
  onDeleteVideo,
  maxItems = 4
}) => {
  // Sort videos by createdAt DESC (newest first)
  const sortedVideos = React.useMemo(() => {
    return [...videos]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, maxItems);
  }, [videos, maxItems]);

  const renderSkeletons = () => {
    return Array.from({ length: maxItems }).map((_, index) => (
      <SkeletonCard key={`skeleton-${index}`} size="large" />
    ));
  };

  if (sortedVideos.length === 0 && !loading) {
    return null;
  }

  return (
    <div className="relative py-8">
      {/* Title */}
      <h2 className="px-4 md:px-8 lg:px-16 text-xl md:text-2xl font-black tracking-tight text-white mb-6 uppercase">
        Trending Now
      </h2>

      {/* Grid Container - 4 cards per row */}
      <div className="px-4 md:px-8 lg:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {loading ? (
            renderSkeletons()
          ) : (
            sortedVideos.map((video, index) => (
              <motion.div
                key={video._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <VideoCard
                  video={video}
                  size="large"
                  isAdmin={isAdmin}
                  onDelete={onDeleteVideo}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TrendingVideos;
