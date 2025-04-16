import React, { createContext, useContext } from 'react';

// Define the type for the context
interface VideoContextType {
  videoPaths: string[];
  getRandomVideoPath: () => string;
}

// Create the context
const VideoContext = createContext<VideoContextType | undefined>(undefined);

// Video paths (you can replace these with actual paths)
const videoPaths = [
  '/videos/video1.mp4',
  '/videos/video2.mp4',
  '/videos/video3.mp4',
];

// Provider component
export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getRandomVideoPath = () => {
    const randomIndex = Math.floor(Math.random() * videoPaths.length);
    return videoPaths[randomIndex];
  };

  return (
    <VideoContext.Provider value={{ videoPaths, getRandomVideoPath }}>
      {children}
    </VideoContext.Provider>
  );
};

// Custom hook to use the VideoContext
export const useVideoContext = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideoContext must be used within a VideoProvider');
  }
  return context;
};