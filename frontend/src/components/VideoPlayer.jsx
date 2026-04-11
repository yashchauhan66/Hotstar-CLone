import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const VideoPlayer = ({ src, title }) => {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHls, setIsHls] = useState(false);

  useEffect(() => {
    if (!src) {
      setError('No video source provided');
      setLoading(false);
      return;
    }

    const hlsSupported = Hls.isSupported();
    const isHlsUrl = src.endsWith('.m3u8');
    setIsHls(isHlsUrl);

    if (isHlsUrl && hlsSupported) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(src);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          setError(`HLS Error: ${data.type}`);
          setLoading(false);
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (isHlsUrl && !hlsSupported) {
      setError('HLS not supported in this browser');
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [src]);

  const handleWaiting = () => setLoading(true);
  const handlePlaying = () => setLoading(false);
  const handleError = () => {
    setError('Failed to load video');
    setLoading(false);
  };

  return (
    <div className="video-player-container">
      {title && <h3 className="video-title">{title}</h3>}
      
      <div className="video-wrapper">
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Loading video...</p>
          </div>
        )}
        
        {error && (
          <div className="error-overlay">
            <p>{error}</p>
          </div>
        )}
        
        <video
          ref={videoRef}
          src={isHls ? undefined : src}
          controls
          autoPlay={false}
          onWaiting={handleWaiting}
          onPlaying={handlePlaying}
          onError={handleError}
          style={{ width: '100%', maxHeight: '70vh' }}
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
