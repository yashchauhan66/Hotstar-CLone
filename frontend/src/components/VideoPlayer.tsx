import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { 
  setVideo, 
  play, 
  pause, 
  setCurrentTime, 
  setDuration, 
  setVolume, 
  toggleMute,
  setQuality,
  toggleFullscreen,
  setLoading,
  setError,
  setBuffered,
  toggleSubtitles
} from '../store/slices/playerSlice';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoplay?: boolean;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  autoplay = false,
  className = '',
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!videoRef.current || !src) {
      console.error('VideoPlayer: Missing video element or source', { videoElement: !!videoRef.current, src });
      return;
    }

    const video = videoRef.current;
    let hls: Hls | null = null;

    // Check if source is HLS or MP4
    const isHls = src.includes('.m3u8');

    console.log('VideoPlayer: Loading video', { src, isHls, autoplay });

    if (isHls && Hls.isSupported()) {
      hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hls.loadSource(src);
      hls.attachMedia(video);
      
      hlsRef.current = hls;

      // HLS events
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        dispatch(setLoading(false));
        if (autoplay) {
          video.play();
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', event, data);
        dispatch(setError('Failed to load video'));
        dispatch(setLoading(false));
      });

      hls.on(Hls.Events.FRAG_BUFFERED, () => {
        if (video.buffered.length > 0) {
          const bufferedEnd = video.buffered.end(video.buffered.length - 1);
          const duration = video.duration;
          const bufferedPercent = (bufferedEnd / duration) * 100;
          dispatch(setBuffered(bufferedPercent));
        }
      });

      // Quality levels
      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        const level = hls.levels[data.level];
        if (level) {
          const quality = `${level.height}p`;
          dispatch(setQuality(quality));
        }
      });
    } else if (isHls && video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = src;
    } else if (!isHls) {
      // MP4 direct playback
      video.src = src;
      
      video.addEventListener('loadedmetadata', () => {
        console.log('VideoPlayer: Video loaded successfully');
        dispatch(setLoading(false));
        if (autoplay) {
          video.play().catch(err => console.error('Autoplay failed:', err));
        }
      });

      video.addEventListener('error', (e) => {
        console.error('VideoPlayer: Video error event', e);
        const error = video.error;
        console.error('VideoPlayer: Error details', {
          code: error?.code,
          message: error?.message,
          src: video.src
        });
        dispatch(setError('Failed to load video'));
        dispatch(setLoading(false));
      });
    }

    // Video events
    const handleTimeUpdate = () => {
      dispatch(setCurrentTime(video.currentTime));
    };

    const handleLoadedMetadata = () => {
      dispatch(setDuration(video.duration));
    };

    const handlePlay = () => {
      dispatch(play());
    };

    const handlePause = () => {
      dispatch(pause());
    };

    const handleVolumeChange = () => {
      dispatch(setVolume(video.volume));
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        const bufferedPercent = (bufferedEnd / duration) * 100;
        dispatch(setBuffered(bufferedPercent));
      }
    };

    const handleFullscreenChange = () => {
      dispatch(toggleFullscreen());
    };

    // Add event listeners
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('fullscreenchange', handleFullscreenChange);
    video.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      // Cleanup
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('fullscreenchange', handleFullscreenChange);
      video.removeEventListener('webkitfullscreenchange', handleFullscreenChange);

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoplay, dispatch]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      dispatch(setCurrentTime(time));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = volume;
      dispatch(setVolume(volume));
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      dispatch(toggleMute());
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full bg-black overflow-hidden ${className}`}
    >
      {/* 
        FIXED: Added object-contain to prevent video stretching
        object-fit: contain = shows full video with black bars (Netflix style)
        object-fit: cover = fills container, crops edges (not recommended for player)
      */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        playsInline
        controls={false}
      />
      
      {/* Custom Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center space-x-4">
          {/* Play/Pause Button */}
          <button
            onClick={handlePlayPause}
            className="text-white hover:text-accent-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>

          {/* Progress Bar */}
          <input
            type="range"
            min="0"
            max="100"
            value={videoRef.current && videoRef.current.duration ? (videoRef.current.currentTime / videoRef.current.duration) * 100 : 0}
            onChange={handleSeek}
            className="flex-1 h-1 bg-primary-500 rounded-lg appearance-none cursor-pointer"
          />

          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleMuteToggle}
              className="text-white hover:text-accent-500 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={videoRef.current?.volume || 1}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-primary-500 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={handleFullscreen}
            className="text-white hover:text-accent-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
