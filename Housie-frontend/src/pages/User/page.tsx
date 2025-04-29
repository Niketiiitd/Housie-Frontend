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
import { useOutletContext } from 'react-router-dom';
import { default as image, default as thumbnailImage } from '../../assets/background.jpg';
import slotMachineSound from '../../assets/random_number.mp3';
import winningSound from '../../assets/win.mp3';
// Type for directory video entries
interface VideoEntry {
  file: File;
  url: string;
  name: string;
}

interface OutletContext {
  selectedSession: any | null; // Replace 'any' with the correct type if known
  directoryVideos: VideoEntry[];
  setDirectoryVideos: (videos: VideoEntry[]) => void;
  videoStatus: string;
  setVideoStatus: (status: string) => void;
  setSequentialMode: (mode: boolean) => void; // Add setter for sequential mode
  isSequentialMode: boolean; // Add sequential mode from context
  quizDirectory: VideoEntry[]; // Add quizDirectory to the context
  ticketData: any; // Add ticket data from context
  quizData: any; // Add quiz data from context
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
    setVideoStatus,
    quizDirectory,
    setQuizDirectory,
    isSequentialMode, // Ensure this is correctly destructured
    setSequentialMode, // Ensure this is correctly destructured
    ticketData, // Extract ticket data from context
    quizData // Extract quiz data from context
  } = useOutletContext<OutletContext>();

  console.log('isSequentialMode:', isSequentialMode); // Debugging: Log the value of isSequentialMode
  console.log('ticketData:', ticketData); // Debugging: Log ticket data
  console.log('quizData:', quizData); // Debugging: Log quiz data

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
    'By Default',
    '1st Row',
    '2nd Row',
    '3rd Row',
    'Full House',
  ]);

  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [quizMedia, setQuizMedia] = useState<{ blob: Blob; url: string } | null>(null);
  const [quizQuestion, setQuizQuestion] = useState<string | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [isQuizAnswerVisible, setIsQuizAnswerVisible] = useState(false);
  const [usedQuizMedia, setUsedQuizMedia] = useState<string[]>([]); // Track used quiz media
  const [isQuizExhaustedDialogOpen, setIsQuizExhaustedDialogOpen] = useState(false); // State for exhausted dialog
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>([]); // Separate array for completed quizzes

  const [isNumberOverlayActive, setIsNumberOverlayActive] = useState(false);
  const [randomNumber, setRandomNumber] = useState<number | null>(null);
  const [usedNumbers, setUsedNumbers] = useState<number[]>([]); // Track used numbers
  const [animatedNumber, setAnimatedNumber] = useState<number | null>(null); // For animation

  const [isGameStarted, setIsGameStarted] = useState(false); // Track if the game has started
  const [isVideoOverlayActive, setIsVideoOverlayActive] = useState(false); // Track if video overlay is active

  const [currentIndex, setCurrentIndex] = useState(0); // Track the current index for sequential mode

  // Modified handleStartQuiz: select media from quizDirectory instead of directoryVideos
  const handleStartQuiz = () => {
    if (quizDirectory.length === 0) {
      console.log('Quiz Directory is empty:', quizDirectory);
      alert('No media available in the quiz directory.');
      return;
    }
  
    // Filter unused quiz media
    const unusedQuizMedia = quizDirectory.filter(
      (media) => !usedQuizMedia.includes(media.name)
    );
  
    if (unusedQuizMedia.length === 0) {
      console.log('All quizzes are exhausted.');
      setIsQuizExhaustedDialogOpen(true); // Show exhausted dialog
      return;
    }
  
    // Randomly select a media file from unused quiz media
    const randomIndex = Math.floor(Math.random() * unusedQuizMedia.length);
    const selectedMedia = unusedQuizMedia[randomIndex];
    const mediaName = selectedMedia.name.split('.').slice(0, -1).join('.');
  
    console.log('Selected Media from Quiz Directory:', selectedMedia);
    console.log('Media Name (without extension):', mediaName);
  
    // Match with quiz JSON data
    const quizEntry = quizData.find(
      (entry) => entry.media.split('.').slice(0, -1).join('.') === mediaName
    );
  
    if (quizEntry) {
      console.log('Matched Quiz Entry:', quizEntry);
      setQuizMedia({ blob: selectedMedia.file, url: selectedMedia.url }); // Pass both Blob and URL
      setQuizQuestion(quizEntry.question);
      setQuizAnswer(quizEntry.answer);
      setUsedQuizMedia((prev) => [...prev, selectedMedia.name]); // Mark media as used
      setCompletedQuizzes((prev) => [...prev, quizEntry.answer]); // Add quiz answer to completed quizzes
      setIsQuizAnswerVisible(false);
      setIsQuizDialogOpen(true);
    } else {
      console.log('No quiz data found for the selected media. Removing it from the array.');
      alert('No quiz data found for the selected media.');
      setQuizDirectory((prev: VideoEntry[]) => prev.filter((media: VideoEntry) => media.name !== selectedMedia.name)); // Remove from array
    }
  };

  const toggleQuizAnswerVisibility = () => {
    setIsQuizAnswerVisible((prev) => !prev);
  };

  // Add a helper function to render media in the Quiz Dialog:
  const renderQuizMedia = (media: { blob: Blob; url: string }) => {
    const { blob, url } = media;
    const mimeType = blob.type;
  
    console.log('Rendering media:', url, 'MIME type:', mimeType);
  
    // If video:
    if (mimeType.match(/^video\//)) {
      return (
        <video controls className="h-[400px] w-[500px] rounded-md">
          <source src={url} type={mimeType} />
          Your browser does not support the video tag.
        </video>
      );
    }
    // If image:
    else if (mimeType.match(/^image\//)) {
      return <img src={url} alt="Quiz Media" className="h-[400px] w-[500px] rounded-md" />;
    }
    // If audio:
    else if (mimeType.match(/^audio\//)) {
      return (
        <audio controls className="w-full">
          <source src={url} type={mimeType} />
          Your browser does not support the audio tag.
        </audio>
      );
    }
    return null;
  };

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
      setIsGameStarted(false); // Reset game state
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
  
    const formattedName = randomVideo.name.replace(/^\d+/, '').replace(/\.mp4$/i, ''); // Remove numeric prefix and .mp4 extension
    setCurrentVideo(randomVideo.url);
    setCurrentVideoName(formattedName);
    setUsedDirectoryVideos([...usedDirectoryVideos, formattedName]);
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

  const playSequentialVideo = useCallback(() => {
    console.log('Playing sequential video:', currentIndex);
    if (directoryVideos.length === 0) {
      setVideoStatus('No videos in directory');
      return;
    }
  
    // Extract numeric prefix and sort videos
    const sortedVideos = [...directoryVideos].map((video) => {
      let numericPrefix = '';
      for (let i = 0; i < video.name.length; i++) {
        const char = video.name[i];
        if (char >= '0' && char <= '9') {
          numericPrefix += char; // Append numeric characters
        } else {
          break; // Stop when a non-numeric character is encountered
        }
      }
      return {
        ...video,
        order: numericPrefix ? parseInt(numericPrefix, 10) : Infinity, // Use Infinity if no numeric prefix
      };
    }).sort((a, b) => a.order - b.order); // Sort by numeric prefix
  
    // Log the sorted array for debugging
    console.log('Sorted Videos by Numeric Prefix:', sortedVideos);
  
    if (currentIndex >= sortedVideos.length) {
      setVideoStatus('All videos have been played sequentially');
      return;
    }
  
    const video = sortedVideos[currentIndex];
    const formattedName = video.name.replace(/^\d+/, '').replace(/\.mp4$/i, ''); // Remove numeric prefix and .mp4 extension
    setCurrentVideo(video.url);
    setCurrentVideoName(formattedName);
    setUsedDirectoryVideos((prev) => [...prev, formattedName]);
    setVideoStatus('');
    setIsAnswerVisible(false);
  }, [directoryVideos, currentIndex]);

  // Handle next video - tries directory first, then falls back to videoPaths
  const handleNextVideo = useCallback(() => {
    if (isSequentialMode) {
      console.log('Sequential mode is active');
      playSequentialVideo(); // Ensure sequential playback
      setCurrentIndex((prevIndex) => prevIndex + 1); // Increment the index after playing the video
    } else {
      // Random mode logic
      if (directoryVideos.length > 0) {
        if (currentVideoName) {
          setUsedDirectoryVideos((prev) => [...prev, currentVideoName.replace(/\.mp4$/i, '')]);
        }
  
        if (playRandomDirectoryVideo()) {
          setIsAnswerVisible(false);
          setMusicName('');
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
        setUsedDirectoryVideos((prev) => [...prev, currentVideoName]);
      }
  
      const videoName = newVideoPath.split('/').pop() || 'Unknown';
  
      setCurrentVideo(newVideoPath);
      setCurrentVideoName(videoName);
      setUsedVideos([...usedVideos, newVideoPath]);
      setVideoStatus('');
      setIsAnswerVisible(false);
      setMusicName('');
  
      if (jsonData && jsonData[videoName]) {
        setCurrentQuestion(jsonData[videoName].question || null);
      } else {
        setCurrentQuestion(null);
      }
    }
  }, [isSequentialMode, playSequentialVideo, playRandomDirectoryVideo, videoPaths, usedVideos, jsonData, currentVideoName, directoryVideos, usedDirectoryVideos, videoStatus]);

  const handleNextWithNumberOverlay = () => {
    if (directoryVideos.length === 0) {
      alert('No videos available in the directory.');
      return;
    }
  
    if (directoryVideos.length === usedNumbers.length) {
      alert('All numbers have been used.');
      return;
    }
  
    setIsNumberOverlayActive(true);
  
    const audio = new Audio(slotMachineSound); // Create an audio instance
    audio.loop = true; // Loop the sound effect
    audio.play(); // Start playing the sound effect
  
    let number: number;
    do {
      number = Math.floor(Math.random() * directoryVideos.length) + 1; // Generate a random number between 1 and the size of directoryVideos
    } while (usedNumbers.includes(number));
  
    // Start animation
    let animationInterval: NodeJS.Timeout;
    let animationCounter = 0;
  
    animationInterval = setInterval(() => {
      const animatedNum = Math.floor(Math.random() * directoryVideos.length) + 1;
      setAnimatedNumber(animatedNum);
      animationCounter++;
  
      if (animationCounter > 30) { // Stop animation after ~3 seconds
        clearInterval(animationInterval);
        audio.pause(); // Stop the sound effect
        audio.currentTime = 0; // Reset the audio playback position
        setRandomNumber(number);
        setUsedNumbers((prev) => [...prev, number]); // Add the number to the used list
        setTimeout(() => {
          setIsNumberOverlayActive(false);
          setRandomNumber(null);
          setAnimatedNumber(null);
          handleNextVideo(); // Call the existing next video logic
          setIsVideoOverlayActive(true); // Show video in overlay
        }, 3000); // Display the final number for 3 seconds
      }
    }, 100); // Change numbers quickly every 100ms
  };

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
      // Removed the line that adds the first video to the usedDirectoryVideos list
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

  const handleShowAnswer = () => {
    setIsAnswerVisible(true);
    if (quizAnswer) {
      setUsedDirectoryVideos((prev) => [...prev, quizAnswer]); // Add quiz answer to completed songs
    }
  };

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
    console.log('Selected Prize:', selectedPrize); // Debugging: Log selected prize
  
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
  
      // Merge completed videos and quizzes
      const completedItems = [...usedDirectoryVideos, ...completedQuizzes];
      console.log('Completed Items:', completedItems); // Debugging: Log merged completed items
  
      // Validate the ticket based on the selected prize
      let isValidTicket = false;
      switch (selectedPrize) {
        case '1st Row':
          isValidTicket = ticketRows[0].every((num) => completedItems.includes(num));
          break;
        case '2nd Row':
          isValidTicket = ticketRows[1].every((num) => completedItems.includes(num));
          break;
        case '3rd Row':
          isValidTicket = ticketRows[2].every((num) => completedItems.includes(num));
          break;
        case 'Full House':
          isValidTicket = ticketRows.flat().every((num) => completedItems.includes(num));
          break;
        default:
          alert('Invalid prize selection.');
          console.log('Invalid prize selection:', selectedPrize); // Debugging: Log invalid prize selection
          return;
      }
  
      setIsCelebrationActive(true); // Show the overlay regardless of ticket validity
      setIsTicketDialogOpen(false); // Close the dialog box
  
      if (isValidTicket) {
        console.log('Ticket is valid for:', selectedPrize); // Debugging: Log valid ticket
        
        const audio = new Audio(winningSound); // Play winning sound
        audio.play();
  
        setAvailablePrizes((prevPrizes) =>
          prevPrizes.filter((prize) => prize !== selectedPrize)
        ); // Remove claimed prize from dropdown
  
        setSelectedPrize(selectedPrize); // Ensure the displayed prize matches the selected prize
      } else {
        console.log('Ticket is invalid for:', selectedPrize); // Debugging: Log invalid ticket
       // Reset the selected prize to avoid showing previous win
      }
      setIsAnswerVisible(isValidTicket);
      
      // Show answer only if the ticket is valid
      
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

  function renderWinningTicket(ticketRows: string[][], completedItems: string[], selectedPrize: string): JSX.Element {
    return (
      <table className="table-auto border-collapse border border-yellow-500 mx-auto mt-4">
        <tbody>
          {ticketRows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((number, colIndex) => (
                <td
                  key={colIndex}
                  className={`border border-yellow-500 px-4 py-2 text-center ${
                    completedItems.includes(number)
                      ? 'bg-green-500 text-red-500 font-bold' // Highlight completed items with red text
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

  const handleStartGame = () => {
    if (directoryVideos.length === 0) {
      alert('No videos available in the directory.');
      return;
    }
  
    console.log(isSequentialMode);
    setIsNumberOverlayActive(true); // Start slot machine animation
    setIsGameStarted(true);
  
    const audio = new Audio(slotMachineSound); // Create an audio instance
    audio.loop = true; // Loop the sound effect
    audio.play(); // Start playing the sound effect
  
    let number: number;
  
    if (isSequentialMode) {
      // Sequential mode logic
      if (currentIndex >= directoryVideos.length) {
        alert('All videos have been played sequentially.');
        setIsNumberOverlayActive(false);
        audio.pause(); // Stop the sound effect
        audio.currentTime = 0; // Reset the audio playback position
        return;
      }
      number = currentIndex + 1; // Use the current index as the number
    } else {
      // Random mode logic
      do {
        number = Math.floor(Math.random() * directoryVideos.length) + 1; // Generate a random number
      } while (usedNumbers.includes(number));
    }
  
    // Start animation
    let animationInterval: NodeJS.Timeout;
    let animationCounter = 0;
  
    animationInterval = setInterval(() => {
      const animatedNum = Math.floor(Math.random() * directoryVideos.length) + 1;
      setAnimatedNumber(animatedNum);
      animationCounter++;
  
      if (animationCounter > 30) { // Stop animation after ~3 seconds
        clearInterval(animationInterval);
        audio.pause(); // Stop the sound effect
        audio.currentTime = 0; // Reset the audio playback position
        setRandomNumber(number);
        setUsedNumbers((prev) => [...prev, number]); // Add the number to the used list
        setTimeout(() => {
          setIsNumberOverlayActive(false);
          setRandomNumber(null);
          setAnimatedNumber(null);
          handleNextVideo(); // Start the game by playing the next video
          setIsVideoOverlayActive(true); // Show video in overlay
        }, 3000); // Display the final number for 3 seconds
      }
    }, 100); // Change numbers quickly every 100ms
  };

  const handleModeChange = (mode: boolean) => {
    setSequentialMode(mode); // Update parent state
  };

  return (
    <div
      className="p-4 sm:p-6 relative min-h-screen text-white"
      style={{
        backgroundImage: `url(${image})`, // Correctly reference the imported image
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay for Prize Claimed */}
      {isCelebrationActive && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-yellow-500">
              {isAnswerVisible ? 'Prize Claimed!' : 'Ticket Not Won'}
            </h1>
            <p className="text-lg text-white mt-2">
              {selectedPrize
                ? `You attempted to claim: ${selectedPrize}`
                : 'No prize selected.'}
            </p>
            {ticketNumber && (
              <div className="mt-4">
                <h2 className="text-2xl font-semibold text-white">Ticket</h2>
                {renderWinningTicket(
                  generateTicket(parseInt(ticketNumber, 10)),
                  [...usedDirectoryVideos, ...completedQuizzes], // Use merged completed items array
                  selectedPrize || ''
                )}
              </div>
            )}
            <Button
              onClick={() => setIsCelebrationActive(false)}
              className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-3 text-lg"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {isNumberOverlayActive && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            {randomNumber === null ? (
              <p className="text-6xl font-bold text-yellow-500 border-4 border-yellow-400 px-4 py-2 inline-block rounded-md animate-pulse">
                🎲 {animatedNumber}
              </p>
            ) : (
              <p className="text-6xl font-bold text-green-500 border-4 border-yellow-400 px-4 py-2 inline-block rounded-md">
                🎲 {randomNumber}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Top Buttons: Claim and Show */}
      <div className="absolute top-4 right-4 flex space-x-2 sm:space-x-4">
        <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="text-sm sm:text-base bg-yellow-500 hover:bg-yellow-600 text-black cursor-pointer px-6 py-3 text-lg"
            >
              Claim
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-yellow-400">Claim Ticket</DialogTitle>
              <DialogDescription className="text-sm text-gray-300">
                Enter your ticket number below, select a prize, and click "Check" to continue.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ticketNumber" className="text-right text-gray-300">
                  Ticket Number
                </Label>
                <Input
                  id="ticketNumber"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  className="col-span-3 bg-gray-700 text-white rounded-md"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="prize" className="text-right text-gray-300">
                  Prize
                </Label>
                <select
                  id="prize"
                  value={selectedPrize}
                  onChange={(e) => {
                    const prize = e.target.value;
                    console.log('Prize selected from dropdown:', prize); // Debugging: Log selected prize
                    setSelectedPrize(prize); // Properly set the selected prize
                  }}
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
              <Button onClick={handleCheckTicket} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 text-lg">
                Check
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsTicketDialogOpen(false)}
                className="text-gray-300 border-gray-500 hover:bg-gray-700 px-6 py-3 text-lg"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          className="text-sm sm:text-base bg-yellow-500 hover:bg-yellow-600 text-black cursor-pointer px-6 py-3 text-lg"
          onClick={handleShowMusicName}
        >
          Show Music Name
        </Button>
      </div>

      {musicName && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setMusicName('')} // Close overlay on clicking anywhere
        >
          <div
            className="text-center"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the content
          >
            <p className="text-4xl font-bold text-green-500 border-4 border-yellow-400 px-4 py-2 inline-block rounded-md">
              🎵 <strong>Music Name:</strong> {musicName} 🎵
            </p>
            
          </div>
        </div>
      )}

      {/* Quiz Dialog */}
      <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-gray-800 text-white rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-yellow-400">Quiz</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {quizMedia && (
              <div className="media-player">
                {renderQuizMedia(quizMedia)} {/* Pass the Blob and URL */}
              </div>
            )}
            {quizQuestion && (
              <div className="question-section">
                <p className="font-medium text-yellow-400">Question:</p>
                <p>{quizQuestion}</p>
              </div>
            )}
            {isQuizAnswerVisible && quizAnswer && (
              <div className="answer-section">
                <p className="font-medium text-yellow-400">Answer:</p>
                <p>{quizAnswer}</p>
              </div>
            )}
            <Button
              variant="outline"
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 text-lg"
              onClick={toggleQuizAnswerVisibility}
            >
              {isQuizAnswerVisible ? 'Hide Answer' : 'Show Answer'}
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsQuizDialogOpen(false)}
              className="text-yellow-500 bg-gray-700 hover:bg-gray-500 hover:text-yellow-500 px-6 py-3 text-lg"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add a dialog to show when all quizzes are exhausted */}
      <Dialog open={isQuizExhaustedDialogOpen} onOpenChange={setIsQuizExhaustedDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-yellow-400">All Quizzes Completed</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <p className="text-center text-gray-300">
              You have completed all the quizzes. Great job!
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsQuizExhaustedDialogOpen(false)}
              className="text-yellow-400 border-gray-500 bg-gray-800"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Media Player */}
      {directoryVideos.length > 0 ? (
        <div className="mt-9  bg-opacity-80 p-4 rounded-lg shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="flex gap-4 justify-center sm:justify-end">
                <Button
                  variant="outline"
                  onClick={handlePrevVideo}
                  className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer px-6 py-3 text-lg "
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={handleStartQuiz}
                  className="bg-purple-500 hover:bg-purple-600 text-white cursor-pointer px-6 py-3 text-lg"
                >
                  Start Quiz
                </Button>
                {!isGameStarted ? (
                  <Button
                    variant="outline"
                    onClick={handleStartGame}
                    className="bg-green-500 hover:bg-green-600 text-white cursor-pointer px-6 py-3 text-lg"
                  >
                    Start
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleNextWithNumberOverlay}
                    className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer px-6 py-3 text-lg"
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Status messages */}
          <div className="space-y-2 mb-4 text-center sm:text-left ">
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

          {/* Video overlay */}
            {isVideoOverlayActive && currentVideo && (
              <div
                className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
                onClick={() => setIsVideoOverlayActive(false)} // Close overlay on clicking outside
              >
                <div className="relative w-[80%] h-[80%]">
                  {/* Close Button */}
                  <button
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded"
                    onClick={() => setIsVideoOverlayActive(false)} // Close overlay on clicking the button
                  >
                    Close
                  </button>
                  <video
                    src={currentVideo}
                    className="w-full h-full rounded-md"
                    controls
                    autoPlay // Automatically play the video
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the video
                  />
                </div>
              </div>
            )}

          {/* Video player */}
          {isGameStarted && currentVideo && !isVideoOverlayActive && (
            <div className="flex justify-center">
              <HeroVideoDialog
                className="rounded-md border border-yellow-500 w-[60%] h-[55%]" // Reduced width and height for a smaller player
                animationStyle="from-center"
                videoSrc={currentVideo || ''}
                thumbnailSrc={thumbnailImage} // Default black thumbnail
                thumbnailAlt="Video Thumbnail"
                // Larger frame for dialog
              />
            </div>
          )}

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


