import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (videoRef.current && !playerRef.current) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        poster,
        fluid: true,
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src, poster]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered rounded-2xl shadow-md"
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
};

export default VideoPlayer;
