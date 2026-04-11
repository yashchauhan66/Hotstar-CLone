import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Info, Star, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

interface Video {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  category: string;
  tags: string[];
  duration: number;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

interface BannerProps {
  video?: Video;
  loading?: boolean;
}

const Banner: React.FC<BannerProps> = ({ video, loading = false }) => {
  if (loading || !video) {
    return (
      <div className="relative w-full h-[85vh] lg:h-[95vh] bg-[#0f0f0f] animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-[#0f0f0f] to-[#1a1a1a]" />
      </div>
    );
  }

  const imageUrl = (() => {
    const src = video.thumbnail || (video as any).image;
    if (!src || (typeof src === 'string' && !src.startsWith('http') && !src.startsWith('/') && !src.startsWith('data:'))) {
      return "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop";
    }
    return src;
  })();

  return (
    <div className="relative w-full h-[85vh] lg:h-[95vh] overflow-hidden bg-[#0f0f0f]">
      {/* Background Image with Parallax-like Fade */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <img
          src={imageUrl}
          alt={video.title}
          className="w-full h-full object-cover object-top lg:object-center"
        />

        {/* Cinematic Gradients */}
        <div className="absolute inset-0 hero-side-gradient" />
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 bg-black/20" />
      </motion.div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end pb-20 lg:pb-32 px-6 md:px-12 lg:px-20 z-10">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl space-y-6"
        >
          {/* Metadata Badges */}
          <div className="flex items-center space-x-3 text-sm font-medium">
            <span className="px-2 py-0.5 rounded bg-[#00A8E1] text-white tracking-widest text-[10px]">PREMIUM</span>
            <span className="text-white/80">•</span>
            <span className="text-white/80 uppercase tracking-wider text-xs">{video.category}</span>
            <span className="text-white/80">•</span>
            <div className="flex items-center space-x-1 text-yellow-500">
              <Star size={14} className="fill-current" />
              <span className="text-white text-xs">{(video.likes / 100).toFixed(1)}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight drop-shadow-2xl">
            {video.title}
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/70 font-light leading-relaxed max-w-2xl line-clamp-3 drop-shadow-lg">
            {video.description}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 pt-4">
            <Link href={`/player/${video._id}`}>
              <button className="flex items-center space-x-2 px-8 py-3.5 bg-white text-black rounded-lg font-bold hover:bg-white/90 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                <Play size={24} className="fill-current" />
                <span>Watch Now</span>
              </button>
            </Link>

            <button className="flex items-center space-x-2 px-8 py-3.5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-lg font-bold hover:bg-white/20 transition-all duration-300 transform hover:scale-105 active:scale-95">
              <Plus size={24} />
              <span>Watchlist</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Decorative Bottom Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00A8E1]/50 to-transparent opacity-50" />
    </div>
  );
};

export default Banner;
