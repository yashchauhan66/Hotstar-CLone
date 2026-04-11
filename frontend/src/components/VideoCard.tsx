import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Trash2 } from 'lucide-react';

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

interface VideoCardProps {
  video: Video;
  size?: 'small' | 'medium' | 'large';
  isAdmin?: boolean;
  onDelete?: (videoId: string) => void;
  showVideoPreview?: boolean;
}

/**
 * Helper: Extract YouTube video ID from URL and return thumbnail URL
 * Format: https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg
 */
const getYouTubeThumbnail = (url: string): string | null => {
  // Match YouTube video ID from various URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  if (match && match[2].length === 11) {
    // Return max resolution thumbnail for Netflix-style portrait
    return `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
  }
  return null;
};

/**
 * Helper: Get thumbnail URL with fallback
 * Priority: 1) video.thumbnail, 2) YouTube from videoUrl, 3) Placeholder
 */
const getThumbnailUrl = (video: Video): string => {
  // 1. Use thumbnail if available
  if (video.thumbnail && video.thumbnail.trim() !== '') {
    return video.thumbnail;
  }
  
  // 2. Try to extract from YouTube URL
  if (video.videoUrl) {
    const youtubeThumb = getYouTubeThumbnail(video.videoUrl);
    if (youtubeThumb) return youtubeThumb;
  }
  
  // 3. Generate placeholder with first letter (16:9 aspect ratio)
  const colors = ['1a1a2e', '16213e', '0f3460', '533483', 'e94560'];
  const titleLength = video.title?.length || 0;
  const color = colors[titleLength % colors.length];
  const firstLetter = video.title?.charAt(0)?.toUpperCase() || '?';
  return `https://placehold.co/400x225/${color}/white?text=${encodeURIComponent(firstLetter)}`;
};

const VideoCard: React.FC<VideoCardProps> = ({ video, size = 'medium', isAdmin = false, onDelete, showVideoPreview = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Size configurations (Netflix-style 16:9 aspect ratio)
  const sizeClasses = {
    small: 'w-40 md:w-48',
    medium: 'w-52 md:w-64',
    large: 'w-64 md:w-80',
  };

  const aspectRatioClass = 'aspect-video';

  // Font classes for modern OTT-style typography
  const fontClasses = {
    title: 'font-sans font-semibold tracking-tight antialiased',
  };

  const thumbnailUrl = getThumbnailUrl(video) || '';

  // Control video playback based on isHovered state
  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (!videoElement || !video.streamingUrl || !showVideoPreview) {
      return;
    }

    let isCancelled = false;

    const controlVideo = async () => {
      if (!isMountedRef.current || isCancelled) return;

      try {
        if (isHovered && shouldLoadVideo) {
          await videoElement.play();
        } else {
          videoElement.pause();
          videoElement.currentTime = 0;
        }
      } catch (error: any) {
        // Ignore AbortError and media removed errors
        if (isMountedRef.current && error.name !== 'AbortError' && !error.message.includes('removed from the document')) {
          console.error('Video playback error:', error);
        }
      }
    };

    controlVideo();

    // Cleanup function
    return () => {
      isCancelled = true;
      if (videoElement) {
        videoElement.pause();
        videoElement.currentTime = 0;
      }
    };
  }, [isHovered, shouldLoadVideo, video.streamingUrl, showVideoPreview]);

  // Set mounted ref and cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.pause();
        videoElement.currentTime = 0;
      }
    };
  }, []);

  const handleMouseEnter = () => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Set timeout for hover delay (300ms)
    hoverTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setShouldLoadVideo(true);
        setIsHovered(true);
      }
    }, 300);
  };

  const handleMouseLeave = () => {
    // Clear timeout if user leaves before delay
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    setIsHovered(false);
    
    // Unload video after delay
    setTimeout(() => {
      if (isMountedRef.current) {
        setShouldLoadVideo(false);
      }
    }, 100);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(video._id);
    }
  };

  return (
    <div 
      className={`${sizeClasses[size]} ${aspectRatioClass} flex-shrink-0`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-900 shadow-md hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 ease-out group">
        {/* Click → Navigate to player page */}
        <Link href={`/player/${video._id}`} className="block w-full h-full">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full h-full"
          >
            {/* THUMBNAIL IMAGE - Changed to object-contain to show full image without cropping */}
            <div className="relative w-full h-full bg-gray-900">
              <Image
                src={thumbnailUrl}
                alt={video.title}
                fill
                className="object-contain"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={size === 'large'}
              />
              
              {/* Video Preview (lazy load only when hovered) */}
              {showVideoPreview && video.streamingUrl && shouldLoadVideo && (
                <video
                  ref={videoRef}
                  src={video.streamingUrl}
                  className="absolute inset-0 w-full h-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              )}
            </div>
            
            {/* Gradient overlay for title readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            
            {/* Play button - Show when NOT hovering */}
            {!isHovered && (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/40 transition-all duration-200"
                >
                  <Play size={20} className="text-white fill-current ml-0.5" />
                </motion.div>
              </div>
            )}
          </motion.div>
        </Link>

        {/* Delete button - Always visible top-right */}
        {isAdmin && onDelete && (
          <motion.button
            onClick={handleDelete}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-2 right-2 z-30 p-1.5 bg-red-600/90 hover:bg-red-500 backdrop-blur-sm text-white rounded-lg shadow-lg transition-all duration-200"
            title="Delete video"
          >
            <Trash2 size={14} />
          </motion.button>
        )}
      </div>
      
      {/* Title below thumbnail */}
      <div className="mt-2 px-1">
        <p className={`${fontClasses.title} text-white text-sm md:text-base leading-tight truncate`}>
          {video.title}
        </p>
      </div>
    </div>
  );
};

export default VideoCard;
