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

import ticketData from '../../../ticket.json';

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

declare module '*.json' {
  const value: Record<string, any>;
  export default value;
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
  const [availablePrizes, setAvailablePrizes] = useState<string[]>([
    '1st Row',
    '2nd Row',
    '3rd Row',
    'Full House',
  ]);

  // Initialize data
  

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

      // Debugging: Log all videos extracted and their count
      console.log('Videos Extracted:', videos);
      console.log('Total Videos Extracted:', videos.length);

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
    } while (usedDirectoryVideos.includes(randomVideo.name.replace(/\.mp4$/i, '')));

    setCurrentVideo(randomVideo.url);
    setCurrentVideoName(randomVideo.name);
    setUsedDirectoryVideos([...usedDirectoryVideos, randomVideo.name.replace(/\.mp4$/i, '')]);
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
    console.log('Attempting to play from directory videos');
    if (directoryVideos.length > 0) {
      if (currentVideoName) {
        // Add the current video to the completed videos array
        setUsedDirectoryVideos((prev) => [...prev, currentVideoName.replace(/\.mp4$/i, '')]);
      }

      if (playRandomDirectoryVideo()) {
        setIsAnswerVisible(false); // Reset show video name to false
        setMusicName(''); // Reset music name visibility

        // Debugging: Log all relevant data
        console.log('Current Video Name:', currentVideoName);
        console.log('Used Directory Videos:', usedDirectoryVideos);
        console.log('Directory Videos:', directoryVideos);
        console.log('Video Status:', videoStatus);

        return;
      }
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

    if (currentVideoName) {
      // Add the current video to the completed videos array
      setUsedDirectoryVideos((prev) => [...prev, currentVideoName.replace(/\.mp4$/i, '')]);
    }

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

    // Debugging: Log all relevant data
    console.log('Current Video Name:', currentVideoName);
    console.log('Used Directory Videos:', usedDirectoryVideos);
    console.log('Directory Videos:', directoryVideos);
    console.log('Video Status:', videoStatus);
  }, [playRandomDirectoryVideo, videoPaths, usedVideos, jsonData, currentVideoName, directoryVideos, usedDirectoryVideos, videoStatus]);

  // Handle previous video
  const handlePrevVideo = useCallback(() => {
    // For directory videos
    if (usedDirectoryVideos.length > 1) {
      const previousVideos = [...usedDirectoryVideos];
      previousVideos.pop(); // Remove current video
      const prevVideoName = previousVideos[previousVideos.length - 1];
      const prevVideo = directoryVideos.find(v => v.name.replace(/\.mp4$/i, '') === prevVideoName);
      
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
      setUsedDirectoryVideos([firstVideo.name.replace(/\.mp4$/i, '')]); // Remove .mp4 here
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

  function generateTicket(ticketId: number): string[][] {
    const ticket = ticketData.find((t) => t.id === ticketId);
    if (!ticket) {
      throw new Error('Ticket not found.');
    }
  
    const numbers = ticket.numbers;
    if (numbers.length !== 15) {
      throw new Error('Invalid ticket data. Must contain exactly 15 numbers.');
    }
  
    // Create a 3x5 ticket
    return [
      numbers.slice(0, 5),
      numbers.slice(5, 10),
      numbers.slice(10, 15),
    ];
  }
  
  function handleCheckTicket(): void {
    console.log('Check button clicked'); // Debugging: Log when the function is triggered
  
    if (!ticketNumber.trim()) {
      alert('Please enter a valid ticket number.');
      console.log('Invalid ticket number:', ticketNumber); // Debugging: Log invalid ticket number
      return;
    }
  
    if (!selectedPrize) {
      alert('Please select a prize to claim.');
      console.log('No prize selected'); // Debugging: Log missing prize selection
      return;
    }
  
    try {
      const ticketId = parseInt(ticketNumber, 10);
      if (isNaN(ticketId)) {
        alert('Invalid ticket number. Must be a numeric ID.');
        console.log('Ticket number is not a valid number:', ticketNumber); // Debugging: Log invalid ticket number format
        return;
      }
  
      const ticketRows = generateTicket(ticketId);
  
      // Debugging: Log the whole ticket
      console.log('Ticket Rows:', ticketRows);
  
      // Debugging: Log the songs completed so far
      const completedSongs = usedDirectoryVideos.map((videoName) => videoName);
      console.log('Songs Completed:', completedSongs);
  
      // Debugging: Log all songs in the directory
      const allSongs = directoryVideos.map((video) => video.name);
      console.log('All Songs in Directory:', allSongs);
  
      // Debugging: Log everything
      console.log('Ticket ID:', ticketId);
      console.log('Selected Prize:', selectedPrize);
      console.log('Used Directory Videos:', usedDirectoryVideos);
      console.log('Directory Videos:', directoryVideos);
  
      // Validate the ticket based on the selected prize
      let isValidTicket = false;
      switch (selectedPrize) {
        case '1st Row':
          isValidTicket = ticketRows[0].every((num) => completedSongs.includes(num));
          break;
        case '2nd Row':
          isValidTicket = ticketRows[1].every((num) => completedSongs.includes(num));
          break;
        case '3rd Row':
          isValidTicket = ticketRows[2].every((num) => completedSongs.includes(num));
          break;
        case 'Full House':
          isValidTicket = ticketRows.flat().every((num) => completedSongs.includes(num));
          break;
        default:
          alert('Invalid prize selection.');
          console.log('Invalid prize selection:', selectedPrize); // Debugging: Log invalid prize selection
          return;
      }
  
      if (isValidTicket) {
        console.log('Ticket is valid for:', selectedPrize); // Debugging: Log valid ticket
        setIsTicketDialogOpen(false); // Close the dialog box
        setAvailablePrizes((prevPrizes) =>
          prevPrizes.filter((prize) => prize !== selectedPrize)
        ); // Remove claimed prize from dropdown
        setTimeout(() => {
          setIsCelebrationActive(true); // Activate the overlay
        }, 300); // Small delay to ensure dialog closes smoothly
      } else {
        alert(`Ticket is invalid for ${selectedPrize}. Please try again.`);
        console.log('Ticket is invalid for:', selectedPrize); // Debugging: Log invalid ticket
      }
    } catch (error) {
      alert('Error validating ticket. Ensure the ticket is in the correct format.');
      console.error('Ticket validation error:', error); // Debugging: Log error details
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

  function handleCancelCelebration(): void {
    setAvailablePrizes((prevPrizes) =>
      prevPrizes.filter((prize) => prize !== selectedPrize)
    ); // Remove claimed prize from dropdown immediately
    setSelectedPrize(''); // Reset the selected prize
    setIsCelebrationActive(false); // Deactivate the overlay
  }

  function renderWinningTicket(ticketRows: string[][], completedSongs: string[], selectedPrize: string): JSX.Element {
    return (
      <table className="table-auto border-collapse border border-yellow-500 mx-auto mt-4">
        <tbody>
          {ticketRows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((number, colIndex) => (
                <td
                  key={colIndex}
                  className={`border border-yellow-500 px-4 py-2 text-center ${
                    completedSongs.includes(number)
                      ? 'bg-green-500 text-red-500 font-bold' // Highlight completed songs with red text
                      : 'bg-gray-700 text-yellow-300'
                  } ${
                    (selectedPrize === '1st Row' && rowIndex === 0) ||
                    (selectedPrize === '2nd Row' && rowIndex === 1) ||
                    (selectedPrize === '3rd Row' && rowIndex === 2) ||
                    (selectedPrize === 'Full House')
                      ? 'font-bold border-4 border-yellow-400' // Highlight selected row or full house
                      : ''
                  }`}
                >
                  {number}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  function handleFinishSession(): void {
    alert('Session finished! Thank you for participating.');
    // Reset or redirect logic can be added here if needed
  }

  return (
    <div className="p-4 sm:p-6 relative bg-gradient-to-b from-blue-500 to-purple-600 min-h-screen text-white">
      {/* Overlay for Prize Claimed */}
      {isCelebrationActive && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-yellow-500">Prize Claimed!</h1>
            <p className="text-lg text-white mt-2">You claimed: <strong>{selectedPrize}</strong></p>
            {selectedPrize && ticketNumber && (
              <div className="mt-4">
                <h2 className="text-2xl font-semibold text-white">Winning Ticket</h2>
                {renderWinningTicket(
                  generateTicket(parseInt(ticketNumber, 10)),
                  usedDirectoryVideos,
                  selectedPrize
                )}
              </div>
            )}
            <Button
              onClick={handleCancelCelebration}
              className="mt-4 bg-green-500 hover:bg-green-600 text-white"
            >
              Close
            </Button>
          </div>
        </div>
      )}

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
                Enter your ticket number below, select a prize, and click "Check" to continue.
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="prize" className="text-right text-white">
                  Prize
                </Label>
                <select
                  id="prize"
                  value={selectedPrize}
                  onChange={(e) => setSelectedPrize(e.target.value)}
                  className="col-span-3 bg-gray-700 text-white rounded-md p-2"
                >
                  <option value="" disabled>
                    Select a prize
                  </option>
                  {availablePrizes.map((prize) => (
                    <option key={prize} value={prize}>
                      {prize}
                    </option>
                  ))}
                </select>
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
        <div className="mt-9 bg-gray-800 p-4 rounded-lg shadow-lg">
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
                {directoryVideos.length - usedDirectoryVideos.length === 0 ? (
                  <Button
                    variant="outline"
                    onClick={handleFinishSession}
                    className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                  >
                    Finish Session
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleNextVideo}
                    className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                  >
                    Next
                  </Button>
                )}
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
              className="w-[500px] h-[500px] rounded-md border border-yellow-500"
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
