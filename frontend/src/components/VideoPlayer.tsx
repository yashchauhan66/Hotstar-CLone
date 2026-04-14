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

    const isHls = src.includes('.m3u8');

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
        if (hls) {
          const level = hls.levels[data.level];
          if (level) {
            const quality = `${level.height}p`;
            dispatch(setQuality(quality));
          }
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

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('fullscreenchange', handleFullscreenChange);
    video.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
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
      className={`group relative w-full h-full bg-[#0a0a0a] overflow-hidden rounded-xl shadow-2xl ${className}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        poster={poster}
        playsInline
        controls={false}
        onClick={handlePlayPause}
      />
      
      {/* Custom Controls Overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent pt-20 pb-6 px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        
        {/* Progress Bar Container */}
        <div className="relative group/progress mb-6">
          <input
            type="range"
            min="0"
            max={videoRef.current?.duration || 100}
            step="0.1"
            value={videoRef.current?.currentTime || 0}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-1.5 opacity-0 cursor-pointer z-20"
          />
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="relative h-full w-full">
              <div 
                className="absolute top-0 left-0 h-full bg-[#00A8E1] transition-all duration-100"
                style={{ width: `${(videoRef.current?.currentTime || 0) / (videoRef.current?.duration || 1) * 100}%` }}
              />
            </div>
          </div>
          <div 
            className="absolute top-1/2 -ml-2 -mt-2 w-4 h-4 bg-[#00A8E1] rounded-full shadow-[0_0_10px_#00A8E1] opacity-0 group-hover/progress:opacity-100 transition-opacity duration-200 pointer-events-none z-10"
            style={{ left: `${(videoRef.current?.currentTime || 0) / (videoRef.current?.duration || 1) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={handlePlayPause}
              className="text-white hover:text-[#00A8E1] transform active:scale-90 transition-all"
            >
              {videoRef.current?.paused ? (
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              ) : (
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              )}
            </button>

            <div className="text-white/80 font-mono text-sm tracking-widest hidden sm:block">
              <span>{Math.floor((videoRef.current?.currentTime || 0) / 60)}:{(Math.floor((videoRef.current?.currentTime || 0) % 60)).toString().padStart(2, '0')}</span>
              <span className="mx-2 text-white/20">/</span>
              <span className="text-white/40">{Math.floor((videoRef.current?.duration || 0) / 60)}:{(Math.floor((videoRef.current?.duration || 0) % 60)).toString().padStart(2, '0')}</span>
            </div>

            <div className="flex items-center group/volume">
              <button
                onClick={handleMuteToggle}
                className="text-white hover:text-[#00A8E1] transition-colors p-2"
              >
                {videoRef.current?.muted || videoRef.current?.volume === 0 ? (
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                )}
              </button>
              
              <div className="w-0 group-hover/volume:w-24 transition-all duration-300 overflow-hidden flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={videoRef.current?.muted ? 0 : (videoRef.current?.volume || 1)}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#00A8E1]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-[10px] font-black tracking-widest text-[#00A8E1] border border-[#00A8E1]/30 px-2 py-1 rounded hidden xs:block">
              HD ULTRA
            </div>

            <button
              onClick={handleFullscreen}
              className="text-white hover:text-[#00A8E1] transition-all transform active:scale-90"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
