import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Info, Share2, Star, Calendar, MessageSquare, Clock } from 'lucide-react';
import { RootState, AppDispatch } from '../../store';
import { fetchVideoById } from '../../store/slices/videoSlice';
import { setVideo, reset } from '../../store/slices/playerSlice';
import VideoPlayer from '../../components/VideoPlayer';

const PlayerPage:
 React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentVideo, isLoading } = useSelector((state: RootState) => state.videos);

  const videoId = router.query.id as string;

  useEffect(() => {
    if (videoId) {
      dispatch(fetchVideoById(videoId));
    }
  }, [videoId, dispatch]);

  useEffect(() => {
    if (currentVideo) {
      console.log('PlayerPage: Video data received', {
        id: currentVideo._id,
        title: currentVideo.title,
        videoUrl: currentVideo.videoUrl,
        streamingUrl: currentVideo.streamingUrl,
        thumbnail: currentVideo.thumbnail
      });
      dispatch(setVideo(currentVideo));
    }
  }, [currentVideo, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#00A8E1] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/60 font-medium tracking-widest text-sm">LOADING CINEMA...</p>
        </div>
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <h1 className="text-4xl font-bold text-white">LOST IN SPACE</h1>
          <p className="text-white/60">The title you're looking for appears to have vanished from our galaxy.</p>
          <button
            onClick={() => router.push('/')}
            className="w-full py-4 bg-[#00A8E1] text-white font-bold rounded-xl shadow-lg shadow-[#00A8E1]/20 transform active:scale-95 transition-all"
          >
            RETURN TO HOME
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#0f0f0f] text-white"
    >
      {/* Cinematic Player Section */}
      <div className="w-full bg-black shadow-2xl">
        <div className="max-w-[1920px] mx-auto">
          <div className="aspect-video relative group">
            {currentVideo.videoUrl || currentVideo.streamingUrl ? (
              <VideoPlayer
                src={currentVideo.videoUrl || currentVideo.streamingUrl}
                poster={currentVideo.thumbnail}
                autoplay={true}
                className="w-full h-full object-contain shadow-[0_0_50px_rgba(0,0,0,1)]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <p className="text-white text-xl">No video source available</p>
                  <p className="text-white/60 mt-2">Please check the video URL</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Content & Metadata */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 lg:py-16">
        <div className="grid lg:grid-cols-[1fr_350px] gap-12">

          {/* Main Info */}
          <div className="space-y-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex flex-wrap gap-4 items-center text-sm font-medium">
                <span className="text-[#00A8E1] tracking-widest font-bold">4K ULTRA HD</span>
                <span className="text-white/20">•</span>
                <div className="flex items-center space-x-1">
                  <Star size={16} className="text-yellow-500 fill-current" />
                  <span className="text-white">{(currentVideo.likes / 100).toFixed(1)}</span>
                </div>
                <span className="text-white/20">•</span>
                <span className="text-white/60 tracking-wider">{(currentVideo.views / 1000).toFixed(1)}K VIEWS</span>
                <span className="text-white/20">•</span>
                <span className="text-white/60">{currentVideo.category.toUpperCase()}</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">{currentVideo.title}</h1>

              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 px-6 py-2.5 glass-effect text-white rounded-lg font-bold hover:bg-white/10 transition-all active:scale-95">
                  <Plus size={20} />
                  <span>Watchlist</span>
                </button>
                <button className="flex items-center space-x-2 px-6 py-2.5 glass-effect text-white rounded-lg font-bold hover:bg-white/10 transition-all active:scale-95">
                  <Share2 size={20} />
                  <span>Share</span>
                </button>
              </div>
            </motion.div>

            {/* Synopsis */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4 border-t border-white/5 pt-8"
            >
              <h3 className="text-lg font-bold tracking-widest text-[#00A8E1]">SYNOPSIS</h3>
              <p className="text-lg text-white/70 leading-relaxed font-light">
                {currentVideo.description}
              </p>

              <div className="flex flex-wrap gap-2 pt-4">
                {currentVideo.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-[#1a1a1a] rounded-full text-xs text-white/40 hover:text-white transition-colors cursor-pointer border border-white/5">
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar / More Info or Related placeholder */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            <div className="glass-effect p-6 rounded-2xl space-y-6">
              <h4 className="font-bold text-white tracking-widest border-b border-white/5 pb-3">DETAILS</h4>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/40">Release Date</span>
                  <span className="text-white font-medium">{new Date(currentVideo.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/40">Audio</span>
                  <span className="text-white font-medium">5.1 Dolby Digital</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/40">Duration</span>
                  <span className="text-white font-medium">{Math.floor(currentVideo.duration / 60)}m {currentVideo.duration % 60}s</span>
                </div>
              </div>

              <div className="pt-4">
                <button className="w-full py-3 bg-[#1a1a1a] hover:bg-[#252525] border border-white/10 rounded-xl transition-all text-xs font-black tracking-widest">
                  SHOW COMMENTS
                </button>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};

export default PlayerPage;
