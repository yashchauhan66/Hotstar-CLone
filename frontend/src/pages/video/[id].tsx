import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { 
  fetchVideoById, 
  likeVideo, 
  unlikeVideo,
  addToFavorites,
  removeFromFavorites,
  addToWatchHistory 
} from '../../store/slices/videoSlice';
import { setVideo, reset } from '../../store/slices/playerSlice';
import Skeleton from '../../components/Skeleton';
import { Play, Clock, Eye, ThumbsUp, Share, Heart, ArrowLeft } from 'lucide-react';

const VideoDetailPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentVideo, isLoading } = useSelector((state: RootState) => state.videos);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const videoId = router.query.id as string;

  useEffect(() => {
    if (videoId) {
      dispatch(fetchVideoById(videoId));
    }
  }, [videoId, dispatch]);

  useEffect(() => {
    if (currentVideo) {
      dispatch(setVideo(currentVideo));
      dispatch(addToWatchHistory(currentVideo._id));
    }
  }, [currentVideo, dispatch]);

  const handlePlay = () => {
    router.push(`/player/${currentVideo?._id}`);
  };

  const handleShare = async () => {
    if (currentVideo) {
      try {
        await navigator.share({
          title: currentVideo.title,
          text: currentVideo.description,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    }
  };

  const handleLike = async () => {
    if (currentVideo && !isLiked) {
      try {
        await dispatch(likeVideo(currentVideo._id)).unwrap();
        setIsLiked(true);
      } catch (error) {
        console.error('Failed to like video:', error);
      }
    } else if (currentVideo && isLiked) {
      try {
        await dispatch(unlikeVideo(currentVideo._id)).unwrap();
        setIsLiked(false);
      } catch (error) {
        console.error('Failed to unlike video:', error);
      }
    }
  };

  const handleToggleFavorites = async () => {
    if (currentVideo) {
      try {
        if (isFavorited) {
          await dispatch(removeFromFavorites(currentVideo._id)).unwrap();
          setIsFavorited(false);
        } else {
          await dispatch(addToFavorites(currentVideo._id)).unwrap();
          setIsFavorited(true);
        }
      } catch (error) {
        console.error('Failed to update favorites:', error);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-100 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Skeleton height={400} className="w-full mb-6" />
              <Skeleton height={40} className="w-full mb-4" />
              <Skeleton height={20} lines={3} className="w-full mb-6" />
              <Skeleton height={30} className="w-32 mb-6" />
            </div>
            <div>
              <Skeleton height={200} className="w-full mb-4" />
              <Skeleton height={20} lines={2} className="w-full mb-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="min-h-screen bg-primary-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Video not found</h1>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-100 pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 text-white/70 hover:text-accent-500 transition-all group"
          >
            <div className="p-2 rounded-lg bg-primary-200 group-hover:bg-accent-500/20 group-hover:text-accent-500 transition-all">
               <ArrowLeft size={20} />
            </div>
            <span className="font-semibold">Back to Home</span>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Video Thumbnail and Play Button */}
            <div className="relative group">
              <img
                src={currentVideo.thumbnail}
                alt={currentVideo.title}
                className="w-full h-auto rounded-lg shadow-2xl"
              />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button
                  onClick={handlePlay}
                  className="bg-accent-500 hover:bg-accent-400 text-white rounded-full p-4 transform hover:scale-110 transition-all duration-300"
                >
                  <Play className="w-12 h-12 fill-current ml-1" />
                </button>
              </div>

              {/* Duration Badge */}
              <div className="absolute bottom-4 right-4 bg-black/80 text-white text-sm px-3 py-1 rounded">
                {formatDuration(currentVideo.duration)}
              </div>
            </div>

            {/* Video Info */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-white">
                {currentVideo.title}
              </h1>

              <div className="flex items-center justify-between text-primary-300">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-5 h-5" />
                    <span>{formatViews(currentVideo.views)} views</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="w-5 h-5" />
                    <span>{formatViews(currentVideo.likes)}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Clock className="w-5 h-5" />
                    <span>{formatDuration(currentVideo.duration)}</span>
                  </div>
                </div>

                <span className="text-sm">
                  {new Date(currentVideo.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePlay}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Play className="w-5 h-5 fill-current ml-1" />
                  <span>Play</span>
                </button>

                <button
                  onClick={handleLike}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <ThumbsUp className="w-5 h-5" />
                  <span>Like</span>
                </button>

                <button
                  onClick={handleShare}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Share className="w-5 h-5" />
                  <span>Share</span>
                </button>

                <button
                  onClick={handleToggleFavorites}
                  className={`btn-secondary flex items-center space-x-2 ${isFavorited ? 'text-red-500' : ''}`}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                  <span>{isFavorited ? 'Favorited' : 'Favorite'}</span>
                </button>
              </div>

              {/* Description */}
              <div className="bg-primary-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                <p className="text-primary-200 leading-relaxed">
                  {currentVideo.description}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {currentVideo.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-primary-300 text-primary-200 text-sm px-3 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Video Details */}
            <div className="bg-primary-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Video Details</h3>
              <div className="space-y-3 text-primary-200">
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span className="text-white">{currentVideo.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="text-white">{formatDuration(currentVideo.duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Views:</span>
                  <span className="text-white">{formatViews(currentVideo.views)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Likes:</span>
                  <span className="text-white">{formatViews(currentVideo.likes)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Uploaded:</span>
                  <span className="text-white">
                    {new Date(currentVideo.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetailPage;
