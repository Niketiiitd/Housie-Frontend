import HeroVideoDialog from '@/components/magicui/hero-video-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVideoContext } from '@/VideoContext';
import { useCallback, useEffect, useRef, useState } from 'react';
import mockData from '/Users/niketagarwal/Desktop/Github repo/Housie-Frontend/Housie-frontend/mock-data.json';

// Type for directory video entries
interface VideoEntry {
  file: File;
  url: string;
  name: string;
}

import { useOutletContext } from 'react-router-dom';

interface OutletContext {
  selectedSession: Session | null;
  directoryVideos: VideoEntry[];
  setDirectoryVideos: (videos: VideoEntry[]) => void;
  videoStatus: string;
  setVideoStatus: (status: string) => void;
}


export default function UserPage() {
  const { 
    selectedSession,
    directoryVideos,
    setDirectoryVideos,
    videoStatus,
    setVideoStatus
  } = useOutletContext<OutletContext>();
  const { videoPaths, getRandomVideoPath } = useVideoContext();
  const [usedVideos, setUsedVideos] = useState<string[]>([]);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [currentVideoName, setCurrentVideoName] = useState<string | null>(null);
  const [jsonData, setJsonData] = useState<Record<string, any> | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [ticketNumber, setTicketNumber] = useState('');
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [isPrizeDialogOpen, setIsPrizeDialogOpen] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState('');
  const [isCelebrationActive, setIsCelebrationActive] = useState(false);
  const [musicName, setMusicName] = useState<string>(''); // Default set to not visible (empty string)
  const [isAnswerVisible, setIsAnswerVisible] = useState(false); // Default set to false
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const directoryInputRef = useRef<HTMLInputElement | null>(null);

  
  const [usedDirectoryVideos, setUsedDirectoryVideos] = useState<string[]>([]);

  // Initialize data
  useEffect(() => {
    setJsonData(mockData);
    console.log('Available video paths:', videoPaths);
  }, [videoPaths]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      directoryVideos.forEach(video => {
        URL.revokeObjectURL(video.url);
      });
    };
  }, [directoryVideos]);

  // Handle directory selection (modern API)
  const handleDirectorySelect = async () => {
    try {
      // @ts-ignore - TypeScript doesn't know about showDirectoryPicker yet
      const directoryHandle = await window.showDirectoryPicker();
      const videos: VideoEntry[] = [];
      
      // Recursively process directory
      for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'file' && 
            entry.name.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)) {
          const file = await entry.getFile();
          const url = URL.createObjectURL(file);
          videos.push({
            file,
            url,
            name: file.name
          });
        }
      }
      
      setDirectoryVideos(videos);
      setUsedDirectoryVideos([]);
      setVideoStatus(`Loaded ${videos.length} videos from directory`);
    } catch (error) {
      console.error('Error accessing directory:', error);
      setVideoStatus('Error accessing directory');
    }
  };

  // Fallback for browsers without directory picker API
  const handleDirectoryInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
      .filter(file => file.type.startsWith('video/') || 
              file.name.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i));
    
    const videos = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    
    setDirectoryVideos(videos);
    setUsedDirectoryVideos([]);
    setVideoStatus(`Loaded ${videos.length} videos from directory`);
  };

  // Play a random video from the selected directory
  const playRandomDirectoryVideo = useCallback(() => {
    if (directoryVideos.length === 0) {
      setVideoStatus('No videos in directory');
      return false;
    }

    if (directoryVideos.length === usedDirectoryVideos.length) {
      setVideoStatus('All directory videos have been played');
      return false;
    }

    let randomVideo: VideoEntry;
    do {
      const randomIndex = Math.floor(Math.random() * directoryVideos.length);
      randomVideo = directoryVideos[randomIndex];
    } while (usedDirectoryVideos.includes(randomVideo.name));

    setCurrentVideo(randomVideo.url);
    setCurrentVideoName(randomVideo.name);
    setUsedDirectoryVideos([...usedDirectoryVideos, randomVideo.name]);
    setVideoStatus(``);
    setIsAnswerVisible(false);

    // Match with JSON data
    const videoKey = randomVideo.name.split('.').slice(0, -1).join('.');
    if (jsonData && jsonData[videoKey]) {
      setCurrentQuestion(jsonData[videoKey].question || null);
    } else {
      setCurrentQuestion(null);
    }

    return true;
  }, [directoryVideos, usedDirectoryVideos, jsonData, setVideoStatus]);

  // Handle next video - tries directory first, then falls back to videoPaths
  const handleNextVideo = useCallback(() => {
    // First try to play from directory
    if (playRandomDirectoryVideo()) {
      setIsAnswerVisible(false); // Reset show video name to false
      setMusicName(''); // Reset music name visibility
      return;
    }

    // Fallback to videoPaths if no directory videos
    if (!videoPaths || videoPaths.length === 0) {
      setVideoStatus('No videos available');
      return;
    }

    if (videoPaths.length === usedVideos.length) {
      setVideoStatus('All videos have been used');
      return;
    }

    let newVideoPath: string;
    do {
      const randomIndex = Math.floor(Math.random() * videoPaths.length);
      newVideoPath = videoPaths[randomIndex];
    } while (usedVideos.includes(newVideoPath));

    const videoName = newVideoPath.split('/').pop() || 'Unknown';

    setCurrentVideo(newVideoPath);
    setCurrentVideoName(videoName);
    setUsedVideos([...usedVideos, newVideoPath]);
    setVideoStatus(``);
    setIsAnswerVisible(false); // Reset show video name to false
    setMusicName(''); // Reset music name visibility

    if (jsonData && jsonData[videoName]) {
      setCurrentQuestion(jsonData[videoName].question || null);
    } else {
      setCurrentQuestion(null);
    }
  }, [playRandomDirectoryVideo, videoPaths, usedVideos, jsonData]);

  // Handle previous video
  const handlePrevVideo = useCallback(() => {
    // For directory videos
    if (usedDirectoryVideos.length > 1) {
      const previousVideos = [...usedDirectoryVideos];
      previousVideos.pop(); // Remove current video
      const prevVideoName = previousVideos[previousVideos.length - 1];
      const prevVideo = directoryVideos.find(v => v.name === prevVideoName);
      
      if (prevVideo) {
        setCurrentVideo(prevVideo.url);
        setCurrentVideoName(prevVideo.name);
        setUsedDirectoryVideos(previousVideos);
        setVideoStatus(``);
        
        const videoKey = prevVideo.name.split('.').slice(0, -1).join('.');
        if (jsonData && jsonData[videoKey]) {
          setCurrentQuestion(jsonData[videoKey].question || null);
        } else {
          setCurrentQuestion(null);
        }
      }
      return;
    }

    // For videoPaths
    if (usedVideos.length <= 1) {
      setVideoStatus('No previous videos available');
      return;
    }

    const previousVideos = [...usedVideos];
    previousVideos.pop();
    const prevVideoPath = previousVideos[previousVideos.length - 1];
    const videoName = prevVideoPath.split('/').pop() || 'Unknown';

    setCurrentVideo(prevVideoPath);
    setCurrentVideoName(videoName);
    setUsedVideos(previousVideos);
    setVideoStatus(``);

    if (jsonData && jsonData[videoName]) {
      setCurrentQuestion(jsonData[videoName].question || null);
    } else {
      setCurrentQuestion(null);
    }
  }, [usedDirectoryVideos, directoryVideos, usedVideos, jsonData]);

  // Automatically play the first video when a directory is loaded
  useEffect(() => {
    if (directoryVideos.length > 0 && usedDirectoryVideos.length === 0) {
      const firstVideo = directoryVideos[0];
      setCurrentVideo(firstVideo.url);
      setCurrentVideoName(firstVideo.name);
      setUsedDirectoryVideos([firstVideo.name]);
      setVideoStatus(``);
      setIsAnswerVisible(false); // Set to false by default

      const videoKey = firstVideo.name.split('.').slice(0, -1).join('.');
      if (jsonData && jsonData[videoKey]) {
        setCurrentQuestion(jsonData[videoKey].question || null);
      } else {
        setCurrentQuestion(null);
      }
    }
  }, [directoryVideos, usedDirectoryVideos, jsonData]);

  const handleShowAnswer = () => setIsAnswerVisible(true);

  const toggleVideoNameVisibility = () => {
    setIsAnswerVisible((prev) => !prev); // Toggle visibility of video name
  };

  function handleCheckTicket(): void {
    if (!ticketNumber.trim()) {
      alert('Please enter a valid ticket number.');
      return;
    }

    // Simulate ticket validation logic
    const isValidTicket = Math.random() > 0.5; // Replace with actual validation logic

    if (isValidTicket) {
      alert(`Ticket ${ticketNumber} is valid!`);
      setIsPrizeDialogOpen(true);
    } else {
      alert(`Ticket ${ticketNumber} is invalid. Please try again.`);
    }
  }
  function handleShowMusicName(): void {
    if (currentVideoName) {
      setMusicName(currentVideoName);
    } else {
      alert('No video is currently playing to show the music name.');
    }
  }
  function handleClaimPrize(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    if (!selectedPrize) {
      alert('Please select a prize to claim.');
      return;
    }

    // Simulate prize claiming logic
    alert(`Congratulations! You have claimed the prize: ${selectedPrize}`);

    // Close the prize dialog and reset the selected prize
    setIsPrizeDialogOpen(false);
    setSelectedPrize('');
    setIsCelebrationActive(true);
  }
  function handleCancelCelebration(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    setIsCelebrationActive(false);
    setSelectedPrize('');
  }
  return (
    <div className="p-4 sm:p-6 relative bg-gradient-to-b from-blue-500 to-purple-600 min-h-screen text-white">
      {/* Top Buttons: Claim and Show */}
      <div className="absolute top-4 right-4 flex space-x-2 sm:space-x-4">
        <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="text-sm sm:text-base bg-yellow-500 hover:bg-yellow-600 text-black cursor-pointer"
            >
              Claim
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Claim Ticket</DialogTitle>
              <DialogDescription>
                Enter your ticket number below and click "Check" to continue.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ticketNumber" className="text-right text-white">
                  Ticket Number
                </Label>
                <Input
                  id="ticketNumber"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  className="col-span-3 bg-gray-700 text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCheckTicket} className="bg-green-500 hover:bg-green-600">
                Check
              </Button>
              <Button variant="outline" onClick={() => setIsTicketDialogOpen(false)} className="text-white border-gray-500">
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          className="text-sm sm:text-base bg-yellow-500 hover:bg-yellow-600 text-black cursor-pointer"
          onClick={handleShowMusicName}
        >
          Show Music Name
        </Button>
      </div>

      {musicName && (
        <p className="mt-2 text-center text-lg font-semibold">
          🎵 <strong>Music Name:</strong> {musicName} 🎵
        </p>
      )}

      {/* Media Player */}
      {directoryVideos.length > 0 ? (
        <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="flex gap-2 justify-center sm:justify-start">
                <Button
                  variant="outline"
                  onClick={handlePrevVideo}
                  className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNextVideo}
                  className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>

          {/* Status messages */}
          <div className="space-y-2 mb-4 text-center sm:text-left">
            <p
              className={`text-sm ${
                videoStatus.includes('Cannot') || videoStatus.includes('Error')
                  ? 'text-red-500'
                  : 'text-gray-300'
              }`}
            >
              {videoStatus}
            </p>
            {directoryVideos.length > 0 && (
              <p className="text-sm text-gray-300">
                {directoryVideos.length - usedDirectoryVideos.length} videos remaining in directory
              </p>
            )}
            {videoPaths.length > 0 && directoryVideos.length === 0 && (
              <p className="text-sm text-gray-300">
                {videoPaths.length - usedVideos.length} videos remaining in library
              </p>
            )}
          </div>

          {/* Video player with HeroVideoDialog */}
          <div className="flex justify-center">
            <HeroVideoDialog
              className="w-[300px] h-[300px] rounded-md border border-yellow-500"
              animationStyle="from-center"
              videoSrc={currentVideo || ''}
              thumbnailSrc="https://via.placeholder.com/300/000000/FFFFFF?text=No+Video" // Default black thumbnail
              thumbnailAlt="Video Thumbnail"
              dialogClassName="w-[90vw] h-[90vh] max-w-4xl" // Larger frame for dialog
            />
          </div>

          {/* Video metadata */}
          {currentVideoName && (
            <div className="mt-4">
              {currentQuestion && (
                <div className="mt-2 p-3 bg-gray-700 rounded-md">
                  <p className="font-medium text-yellow-400">Question:</p>
                  <p>{currentQuestion}</p>
                  {isAnswerVisible && (
                    <>
                      <p className="font-medium mt-2 text-yellow-400">Answer:</p>
                      <p>
                        {jsonData && currentVideoName
                          ? jsonData[currentVideoName.split('.').slice(0, -1).join('.')]?.answer ||
                            'No answer available'
                          : 'No answer available'}
                      </p>
                    </>
                  )}
                  <Button
                    variant="outline"
                    className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-black"
                    onClick={toggleVideoNameVisibility}
                  >
                    {isAnswerVisible ? 'Hide Answer' : 'Show Answer'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-300 mt-6 text-center">No videos loaded. Please select a directory.</p>
      )}
    </div>
  );
}
