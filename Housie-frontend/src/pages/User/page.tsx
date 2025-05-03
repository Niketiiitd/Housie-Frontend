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
import focusElectronWindow from './Electron';
import { Label } from '@/components/ui/label';
import { useVideoContext } from '@/VideoContext';
import { Fireworks } from 'fireworks-js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { default as image, default as thumbnailImage } from '../../assets/background.jpg';
import NonWinSound from '../../assets/non-win.mp3';
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
  prizeQuotas: { prize: string; quota: number }[]; // Add prize quotas to context
  setPrizeQuotas: React.Dispatch<React.SetStateAction<{ prize: string; quota: number }[]>>; // Setter for prize quotas
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
    quizData, // Extract quiz data from context
    prizeQuotas, // Use prizeQuotas from context
    setPrizeQuotas, // Use setter from context
  } = useOutletContext<OutletContext>();

  // console.log('isSequentialMode:', isSequentialMode); // Debugging: Log the value of isSequentialMode
  // console.log('ticketData:', ticketData); // Debugging: Log ticket data
  // console.log('quizData:', quizData); // Debugging: Log quiz data

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
  // ...existing code...
const [isCompletedSongsDialogOpen, setIsCompletedSongsDialogOpen] = useState(false);
// Define prizeQuotas with initial values
const [isCheckOverlayOpen, setIsCheckOverlayOpen] = useState(false); // State for the check overlay
const [checkedTicketRows, setCheckedTicketRows] = useState<string[][] | null>(null); // Store the checked ticket rows
const [isTicketEligible, setIsTicketEligible] = useState(false); // Track if the ticket is eligible

// Function to check ticket eligibility
// Updated handleCheckTicket1 function
const handleCheckTicket1 = () => {
  if (!ticketNumber.trim()) {
    alert('Please enter a valid ticket number.');
    return;
  }

  if (!selectedPrize) {
    alert('Please select a prize to check.');
    return;
  }

  const ticketId = parseInt(ticketNumber, 10);
  if (isNaN(ticketId)) {
    alert('Invalid ticket number. Must be numeric.');
    return;
  }

  const ticket = ticketData.find((t) => t.id === ticketId);
  if (!ticket) {
    alert('Ticket not found.');
    return;
  }

  const ticketRows = generateTicket(ticketId);
  const completedItems = [...usedDirectoryVideos, ...completedQuizzes].map((item) =>
    item.toString()
  ); // Ensure all items are strings for comparison
  let isValidTicket = false;

  switch (selectedPrize) {
    case '1st Row':
      isValidTicket = ticketRows[0].every((num) => completedItems.includes(num.toString()));
      break;
    case '2nd Row':
      isValidTicket = ticketRows[1].every((num) => completedItems.includes(num.toString()));
      break;
    case '3rd Row':
      isValidTicket = ticketRows[2].every((num) => completedItems.includes(num.toString()));
      break;
    case 'Full House':
      isValidTicket = ticketRows.flat().every((num) => completedItems.includes(num.toString()));
      break;
    case 'Early 5':
      isValidTicket =
        ticketRows.flat().filter((num) => completedItems.includes(num.toString())).length >= 5;
      break;
    case 'Early 7':
      isValidTicket =
        ticketRows.flat().filter((num) => completedItems.includes(num.toString())).length >= 7;
      break;
    default:
      alert('Invalid prize selection.');
      return;
  }

  // Show an alert with the result
  if (isValidTicket) {
    alert(`Ticket Number ${ticketNumber} is eligible for the prize: ${selectedPrize}!`);
  } else {
    alert(`Ticket Number ${ticketNumber} is NOT eligible for the prize: ${selectedPrize}.`);
  }
};
  
  const [usedDirectoryVideos, setUsedDirectoryVideos] = useState<string[]>([]);
  const [availablePrizes, setAvailablePrizes] = useState<string[]>([
    'By Default',
    '1st Row',
    '2nd Row',
    '3rd Row',
    'Full House',
  ]);
  const [winningAnswer, setWinningAnswer] = useState('');
  const [lastPlayedSongs, setLastPlayedSongs] = useState<string[]>([]);
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

  const [isProcessingNext, setIsProcessingNext] = useState(false); // Track if 'n' is being processed
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref to manage timeout

  const [isDiceRolling, setIsDiceRolling] = useState(false); // Track if dice animation is rolling
  const [luckyDrawNames, setLuckyDrawNames] = useState<string[]>([]);
const [luckyDrawWinner, setLuckyDrawWinner] = useState<string | null>(null);
const [isLuckyDrawActive, setIsLuckyDrawActive] = useState(false);

const [isLuckyDrawDialogOpen, setIsLuckyDrawDialogOpen] = useState(false);
const [allTickets, setAllTickets] = useState<string[]>([]); // Store all ticket numbers
const [luckyDrawWinningTicket, setLuckyDrawWinningTicket] = useState<string | null>(null);
const [isLuckyDrawAnimationActive, setIsLuckyDrawAnimationActive] = useState(false);
const [selectedTickets, setSelectedTickets] = useState<string[]>([]); // Track selected tickets

const handleSelectAllTickets = () => {
  const tickets = ticketData.map((ticket: any) => ticket.id.toString());
  setAllTickets(tickets);
  setSelectedTickets(tickets); // Select all tickets
};

const handleToggleTicketSelection = (ticket: string) => {
  setSelectedTickets((prev) =>
    prev.includes(ticket)
      ? prev.filter((t) => t !== ticket) // Deselect if already selected
      : [...prev, ticket] // Add to selection if not already selected
  );
};
const stopSoundAndAnimation = () => {
  // Stop any ongoing audio
  const audioElements = document.querySelectorAll('audio');
  audioElements.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0; // Reset audio playback position
  });

  // Clear any ongoing animation intervals
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }
};

const handleStartLuckyDrawForTickets = () => {
  if (selectedTickets.length < 2) {
    alert('Please select at least two tickets for the lucky draw.');
    return;
  }

  setIsLuckyDrawDialogOpen(false); // Close the Lucky Draw dialog
  setIsLuckyDrawAnimationActive(true); // Start the animation

  let animationCounter = 0;
  const audio = new Audio(slotMachineSound);
  audio.loop = true;
  audio.play();

  const interval = setInterval(() => {
    const randomIndex = Math.floor(Math.random() * selectedTickets.length);
    setLuckyDrawWinningTicket(selectedTickets[randomIndex]); // Temporarily set a random ticket
    animationCounter++;

    if (animationCounter > 15) { // Stop animation after ~3 seconds
      clearInterval(interval);
      audio.pause();
      audio.currentTime = 0;
      setIsLuckyDrawAnimationActive(false); // Stop the animation
      setIsCelebrationActive(true); // Show the winner overlay

      // Play the winning sound
      const winningAudio = new Audio(winningSound);
      winningAudio.play();
    }
  }, 100); // Change ticket numbers quickly every 100ms
};

const handleAddNameToLuckyDraw = (name: string) => {
  if (name.trim() !== '' && !luckyDrawNames.includes(name.trim())) {
    setLuckyDrawNames((prev) => [...prev, name.trim()]);
  } else if (luckyDrawNames.includes(name.trim())) {
    alert('This name is already added.');
  }
};

const handleStartLuckyDraw = () => {
  if (luckyDrawNames.length < 2) {
    alert('Please enter at least two names for the lucky draw.');
    return;
  }

  if (!selectedPrize) {
    alert('Please select a prize for the lucky draw.');
    return;
  }

  setIsTicketDialogOpen(false); // Close the claim dialog box
  setIsLuckyDrawActive(true); // Activate the rolling animation

  let animationCounter = 0;
  const audio = new Audio(slotMachineSound); // Play the slot machine sound
  audio.loop = true;
  audio.play();

  const interval = setInterval(() => {
    const randomIndex = Math.floor(Math.random() * luckyDrawNames.length);
    setLuckyDrawWinner(luckyDrawNames[randomIndex]); // Temporarily set a random name
    animationCounter++;

    if (animationCounter > 15) { // Stop animation after ~3 seconds
      clearInterval(interval);
      audio.pause();
      audio.currentTime = 0;
      setIsLuckyDrawActive(false); // Stop the rolling animation
      setIsCelebrationActive(true); // Show the winner overlay

      // Play the winning sound
      const winningAudio = new Audio(winningSound);
      winningAudio.play();

      // Decrement the prize quota
      setPrizeQuotas((prev) =>
        prev.map((prize) =>
          prize.prize === selectedPrize ? { ...prize, quota: prize.quota - 1 } : prize
        )
      );
    }
  }, 100); // Change names quickly every 100ms
};

const handleClaimPrizeAfterLuckyDraw = () => {
  if (!luckyDrawWinner || !selectedPrize) {
    alert('Please complete the lucky draw and select a prize.');
    return;
  }

  const prizeQuota = prizeQuotas.find((prize) => prize.prize === selectedPrize);
  if (!prizeQuota || prizeQuota.quota <= 0) {
    alert(`The prize "${selectedPrize}" is no longer available.`);
    return;
  }

  setPrizeQuotas((prev: { prize: string; quota: number }[]) =>
    prev.map((prize: { prize: string; quota: number }) =>
      prize.prize === selectedPrize ? { ...prize, quota: prize.quota - 1 } : prize
    )
  );

  const audio = new Audio(winningSound);
  audio.play();

  setWinningAnswer(`Congratulations ${luckyDrawWinner}! You have won: ${selectedPrize}`);
  setLuckyDrawNames([]);
  setLuckyDrawWinner(null);
  setSelectedPrize('');
};

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
  const handleDeleteNameFromLuckyDraw = (index: number) => {
    setLuckyDrawNames((prev) => prev.filter((_, i) => i !== index));
  };

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
    console.log("played songs", lastPlayedSongs);
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
      // Update the last played songs
      console.log(lastPlayedSongs);
    setLastPlayedSongs((prev) => {
      const updatedSongs = [...prev, videoName];
      
      return updatedSongs.slice(-3); // Keep only the last 3 songs
    });

  
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
    setIsDiceRolling(true); // Disable key presses during dice animation
  
    const audio = new Audio(slotMachineSound); // Create an audio instance
    audio.loop = true; // Loop the sound effect
    audio.play(); // Start playing the sound effect
  
    let number;
    do {
      number = Math.floor(Math.random() * directoryVideos.length) + 1; // Generate a random number
    } while (usedNumbers.includes(number));
  
    let animationInterval;
    let animationCounter = 0;
  
    animationInterval = setInterval(() => {
      const animatedNum = Math.floor(Math.random() * directoryVideos.length) + 1;
      setAnimatedNumber(animatedNum);
      animationCounter++;
  
      if (animationCounter > 15) { // Stop animation after ~3 seconds
        clearInterval(animationInterval);
        audio.pause();
        audio.currentTime = 0;
        setRandomNumber(number);
        setUsedNumbers((prev) => [...prev, number]);
        setTimeout(() => {
          setIsNumberOverlayActive(false);
          setRandomNumber(null);
          setAnimatedNumber(null);
          setIsDiceRolling(false); // Re-enable key presses after animation
          handleNextVideo();
          setIsVideoOverlayActive(true);
        }, 1500);
      }
    }, 50);
  };
  useEffect(() => {
    if (isAnswerVisible) {
      const container = document.getElementById('fireworks-container');
      if (container) {
        const fireworks = new Fireworks(container, {
          speed: 2,
          acceleration: 1.05,
          friction: 0.95,
          gravity: 1.5,
          particles: 150,
          hue: 120,
          sound: { enable: false },
        });
        fireworks.start();
        return () => fireworks.stop();
      }
    }
  }, [isAnswerVisible]);

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
      const formattedName = firstVideo.name.replace(/^\d+/, '').replace(/\.mp4$/i, ''); // Format the name
      setCurrentVideo(firstVideo.url);
      setCurrentVideoName(formattedName);
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
  
  
  // ...existing code...

  function handleCheckTicket(): void {
    console.log('Check button clicked');
  
    if (!ticketNumber.trim()) {
      alert('Please enter a valid ticket number.');
      return;
    }
  
    if (!selectedPrize) {
      alert('Please select a prize to claim.');
      return;
    }
  
    const prizeQuota = prizeQuotas.find((prize) => prize.prize === selectedPrize);
    if (!prizeQuota || prizeQuota.quota <= 0) {
      alert(`The prize "${selectedPrize}" is no longer available.`);
      return;
    }
  
    console.log(`Selected Prize: ${selectedPrize}, Remaining Quota: ${prizeQuota.quota}`);
  
    try {
      const ticketId = parseInt(ticketNumber, 10);
      if (isNaN(ticketId)) {
        alert('Invalid ticket number. Must be numeric.');
        return;
      }
  
      const ticketRows = generateTicket(ticketId);
      const completedItems = [...usedDirectoryVideos, ...completedQuizzes].map((item) =>
        item.toString()
      ); // Ensure all items are strings for comparison
      let isValidTicket = false;
  
      switch (selectedPrize) {
        case '1st Row':
          isValidTicket = ticketRows[0].every((num) => completedItems.includes(num.toString()));
          break;
        case '2nd Row':
          isValidTicket = ticketRows[1].every((num) => completedItems.includes(num.toString()));
          break;
        case '3rd Row':
          isValidTicket = ticketRows[2].every((num) => completedItems.includes(num.toString()));
          break;
        case 'Full House':
          isValidTicket = ticketRows.flat().every((num) => completedItems.includes(num.toString()));
          break;
        case 'Early 5':
          isValidTicket =
            ticketRows.flat().filter((num) => completedItems.includes(num.toString())).length >= 5;
          break;
        case 'Early 7':
          isValidTicket =
            ticketRows.flat().filter((num) => completedItems.includes(num.toString())).length >= 7;
          break;
        default:
          alert('Invalid prize selection.');
          return;
      }
  
      setIsCelebrationActive(true);
      setIsTicketDialogOpen(false);
  
      if (isValidTicket) {
        console.log('Ticket is valid for:', selectedPrize);
        const audio = new Audio(winningSound);
        audio.play();
  
        // Decrement the prize quota
        setPrizeQuotas((prev) =>
          prev.map((prize) =>
            prize.prize === selectedPrize ? { ...prize, quota: prize.quota - 1 } : prize
          )
        );
  
        console.log(
          `Prize "${selectedPrize}" claimed. Updated Quotas:`,
          prizeQuotas.map((prize) => `${prize.prize}: ${prize.quota}`)
        );
  
        // Store a congratulatory answer message:
        setWinningAnswer(`Congratulations! You have won: ${selectedPrize}`);
      } else {
        console.log('Ticket is invalid for:', selectedPrize);
        const audioNonWin = new Audio(NonWinSound);
        audioNonWin.play();
        setWinningAnswer('');
      }
      setIsAnswerVisible(isValidTicket);
    } catch (error) {
      alert('Error validating ticket. Ensure the ticket is in the correct format.');
      console.error('Ticket validation error:', error);
    }
  }

// ...existing code...

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
    const ticketInput = document.getElementById('ticketNumber') as HTMLInputElement;
    if (ticketInput) {
      ticketInput.focus();
    }

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
                  className={`border border-yellow-500 px-4 py-2 text-center text-4xl font-bold ${
                    completedItems.includes(number)
                      ? 'bg-blue-500 text-yellow-300' // Completed songs: blue background, yellow text
                      : 'bg-white text-black' // Uncompleted songs: white background, black text
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
  
      if (animationCounter > 10) { // Stop animation after ~3 seqconds
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
        }, 1500); // Display the final number for 3 seconds
      }
    }, 50); // Change numbers quickly every 100ms
  };

  const handleModeChange = (mode: boolean) => {
    setSequentialMode(mode); // Update parent state
  };

  // Automatically reveal the answer, close video overlay, and play the next video
  const handleVideoEnd = () => {
    setIsVideoOverlayActive(false); // Close the video overlay
    handleShowMusicName(); // Use existing function to fetch and display the answer
    setTimeout(() => {
      setMusicName(''); // Hide the answer overlay after 5 seconds
      handleNextWithNumberOverlay(); // Automatically play the next video
    }, 2000); // Delay for 5 seconds to show the answer
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Do not process global keys if an input-like element is focused
      if (
        document.activeElement &&
        ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)
      ) {
        return;
      }
      if (isDiceRolling) return; // Ignore key presses during dice animation
  
      // Close overlays and dialog boxes only when no input is focused
      setIsVideoOverlayActive(false);
      setIsCelebrationActive(false);
      setIsTicketDialogOpen(false);
      setIsQuizDialogOpen(false);
      setIsQuizExhaustedDialogOpen(false);
      setMusicName('');
      setIsNumberOverlayActive(false);
  
      switch (event.key) {
        case 'q':
          handleStartQuiz();
          break;
        case 's':
          if (!isGameStarted) {
            handleStartGame();
          }
          break;
        case 'n':
          if (isGameStarted && !isProcessingNext) {
            setIsProcessingNext(true);
            handleShowMusicName();
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
              setMusicName('');
              handleNextWithNumberOverlay();
              setIsProcessingNext(false);
            }, 10000);
          } else if (isProcessingNext) {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            setMusicName('');
            handleNextWithNumberOverlay();
            setIsProcessingNext(false);
          }
          break;
        case 'c':
          setIsTicketDialogOpen(true);
          break;
        case 'r':
          handleShowMusicName();
          break;
        case 'x':
          if (isCelebrationActive) {
            stopSoundAndAnimation(); // Stop sound and animation
            setIsCelebrationActive(false);
          }
          break;
        case 'v':
          if (isVideoOverlayActive) {
            stopSoundAndAnimation(); // Stop sound and animation
            setIsVideoOverlayActive(false);
          }
          break;
        case 'm':
          if (musicName) {
            setMusicName('');
          }
          break;
        default:
          break;
      }
    };
  
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    handleStartQuiz,
    handleStartGame,
    handleNextWithNumberOverlay,
    isGameStarted,
    setIsTicketDialogOpen,
    handleShowMusicName,
    isCelebrationActive,
    isVideoOverlayActive,
    musicName,
    setMusicName,
    isProcessingNext, // Include the new state in dependencies
    isDiceRolling, // Include the new state in dependencies
  ]);

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
     {isCelebrationActive && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div className="text-center">
      {/* Always display Ticket Number */}
      <h1 className="text-6xl font-extrabold text-yellow-500 mb-6 animate-bounce">
        🎉 Ticket No: {ticketNumber} 🎉
      </h1>

      {/* Render Ticket (shown when ticketNumber exists) */}
      {ticketNumber && (
        <div className="bg-white text-black p-6 rounded-lg shadow-lg mt-6">
          <h2 className="text-4xl font-bold mb-4">Your Ticket</h2>
          {renderWinningTicket(
            generateTicket(parseInt(ticketNumber, 10)),
            [...usedDirectoryVideos, ...completedQuizzes],
            selectedPrize || ''
          )}
        </div>
      )}

            {/* Display appropriate message */}
            <h1 className="text-6xl font-bold text-green-500 mt-6 animate-pulse">
        {isAnswerVisible
          ? ` Ticket Won! Ticket No: ${ticketNumber} `
          : 'Ticket Not Won 👎😭'}
      </h1>
      {isAnswerVisible ? (
        <>
        </>
      ) : (
        <div className="my-4 flex justify-center"></div>
      )}
      <p className="text-4xl text-white mt-4">
        {selectedPrize ? (
          <>
            You claimed: 
            <span className="font-extrabold text-yellow-400 ml-2">
              {selectedPrize}
            </span>
          </>
        ) : (
          'No prize selected.'
        )}
      </p>

      {/* Close Button */}
      <Button
        onClick={() => {setIsCelebrationActive(false);
          stopSoundAndAnimation(); // Stop sound and animation,
        }}
        className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-3 text-lg"
      >
        Close
      </Button>
    </div>
  </div>
)}

{/* Celebration Overlay */}
{isCelebrationActive && luckyDrawWinner && (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center">
          <h1 className="text-6xl font-extrabold text-yellow-500 mb-6 animate-bounce">
            🎉 Winner: {luckyDrawWinner} 🎉
          </h1>
          {selectedPrize && (
            <p className="text-4xl font-bold text-green-500 mt-4">
              Prize Claimed: <span className="text-yellow-400">{selectedPrize}</span>
            </p>
          )}
          <Button
            onClick={() => {
              setIsCelebrationActive(false);
              setLuckyDrawWinner(null);
              stopSoundAndAnimation(); // Stop sound and animation
              setSelectedPrize(''); // Reset the selected prize
            }}
            className="mt-6 bg-green-500 hover:bg-green-600 text-white px-6 py-3 text-lg"
          >
            Close
          </Button>
        </div>
      </div>
    )}

    {/* Lucky Draw Rolling Animation Overlay */}
    {isLuckyDrawActive && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div className="text-center">
      <p className="text-6xl font-bold text-yellow-500 border-4 border-yellow-400 px-4 py-2 inline-block rounded-md animate-pulse">
        🎲 {luckyDrawWinner || luckyDrawNames[Math.floor(Math.random() * luckyDrawNames.length)]}
      </p>
      <p className="text-4xl font-bold text-green-500 mt-4">
        Prize: <span className="text-yellow-400">{selectedPrize}</span>
      </p>
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
      <div className="absolute top-4 right-4 flex flex-col space-x-1 space-y-4 ">
      <Dialog
  open={isTicketDialogOpen}
  onOpenChange={(isOpen) => {
    setIsTicketDialogOpen(isOpen);
    if (isOpen) {
      setSelectedPrize(''); // Reset the prize selection to default when the dialog opens
    } else {
      // Return focus to the ticket number input field when the dialog is closed
      const ticketInput = document.getElementById('ticketNumber') as HTMLInputElement;
      if (ticketInput) {
        ticketInput.focus();
      }
    }
  }}
>
  <DialogTrigger asChild>
    <Button
      variant="outline"
      className="w-[100%] text-lg sm:text-xl bg-yellow-500 hover:bg-yellow-600 text-black cursor-pointer px-8 py-4"
    >
      Claim
    </Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white rounded-lg shadow-lg">
    <DialogHeader>
      <DialogTitle className="text-lg font-bold text-yellow-400">Claim Ticket</DialogTitle>
      <DialogDescription className="text-sm text-gray-300">
        Enter your ticket number below, select a prize, and click "Check" to continue. If multiple people claim, use the lucky draw option.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      {/* Ticket Number Input */}
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

      {/* Prize Selection */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="prize" className="text-right text-gray-300">
          Prize
        </Label>
        <select
          id="prize"
          value={selectedPrize || "By Default"}
          onChange={(e) => setSelectedPrize(e.target.value)}
          className="col-span-3 bg-gray-700 text-white rounded-md p-2"
        >
          <option value="By Default" disabled>
            By Default
          </option>
          {prizeQuotas
            .filter((prize) => prize.quota > 0)
            .map((prize) => (
              <option key={prize.prize} value={prize.prize}>
                {prize.prize} (Remaining: {prize.quota})
              </option>
            ))}
        </select>
      </div>

      {/* Lucky Draw Section */}
<div className="grid gap-4">
  <p className="text-yellow-400 font-bold">Lucky Draw (Optional)</p>
  <div className="grid grid-cols-4 items-center gap-4">
    <Label htmlFor="luckyDrawName" className="text-right text-gray-300">
      Name
    </Label>
    <Input
      id="luckyDrawName"
      placeholder="Enter name"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleAddNameToLuckyDraw(e.currentTarget.value);
          e.currentTarget.value = '';
        }
      }}
      className="col-span-3 bg-gray-700 text-white rounded-md"
    />
  </div>
  {luckyDrawNames.length > 0 && (
    <div className="text-gray-300">
      <p className="font-bold">Participants:</p>
      <div className="max-h-[150px] overflow-y-auto border border-gray-600 rounded-md p-2">
        <ul className="list-disc ml-6">
          {luckyDrawNames.map((name, index) => (
            <li key={index} className="flex items-center justify-between">
              <span>{name}</span>
              <Button
                variant="outline"
                onClick={() => handleDeleteNameFromLuckyDraw(index)}
                className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white px-2 py-1 text-sm"
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )}
  <Button
    onClick={handleStartLuckyDraw}
    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 text-lg"
  >
    Start Lucky Draw
  </Button>


        {luckyDrawWinner && isCelebrationActive && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div className="text-center">
      <h1 className="text-6xl font-extrabold text-yellow-500 mb-6 animate-bounce">
        🎉 Winner: {luckyDrawWinner} 🎉
      </h1>
      {selectedPrize && (
        <p className="text-4xl font-bold text-green-500 mt-4">
          Prize Claimed: <span className="text-yellow-400">{selectedPrize}</span>
        </p>
      )}
      <Button
        onClick={() => {
          setIsCelebrationActive(false);
          setLuckyDrawWinner(null);
          setSelectedPrize(''); // Reset the selected prize
          stopSoundAndAnimation(); // Stop sound and animation
        }}
        className="mt-6 bg-green-500 hover:bg-green-600 text-white px-6 py-3 text-lg"
      >
        Close
      </Button>
    </div>
  </div>
)}
      </div>
    </div>

    <DialogFooter>
    <Button
    onClick={handleCheckTicket1}
    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 text-lg"
  >
    Check
  </Button>
    <Button
  onClick={() => {
    if (!ticketNumber.trim()) {
      alert('Please enter a valid ticket number before claiming the prize.');
      return;
    }
    
    handleCheckTicket();
    setIsTicketDialogOpen(false); // Corrected the typo from `setIsTicketDialtext-l` to `setIsTicketDialogOpen`
  }}
  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 text-lg"
>
  Claim
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
          className="text-lg sm:text-xl bg-yellow-500 hover:bg-yellow-600 text-black cursor-pointer px-8 py-4"
          onClick={handleShowMusicName}
        >
          Reveal Answer
        </Button>
        <Dialog open={isCompletedSongsDialogOpen} onOpenChange={setIsCompletedSongsDialogOpen}>
  <DialogTrigger asChild>
    <Button
      variant="outline"
      className="text-lg sm:text-xl bg-yellow-500 hover:bg-yellow-600 text-black cursor-pointer px-8 py-4"
    >
      List
    </Button>
  </DialogTrigger>
  <DialogContent className="w-screen min-w-screen max-w-none bg-gray-800 text-white rounded-lg shadow-lg">
    <DialogHeader>
      
    </DialogHeader>
    <div className="flex flex-col gap-4 py-4">
      {usedDirectoryVideos.length > 0 ? (
        <ul className="list-disc ml-6 max-h-[400px] overflow-y-auto pr-4">
          {usedDirectoryVideos.map((song, index) => (
            <li key={index} className="text-7xl text-yellow-300 font-bold">
              {song}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-300">No completed songs yet.</p>
      )}
    </div>
    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => setIsCompletedSongsDialogOpen(false)}
        className="text-yellow-400 border-gray-500 bg-gray-800"
      >
        Close
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
      </div>

      {musicName && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => {setMusicName('')
            stopSoundAndAnimation(); // Stop sound and animation
          }} // Close overlay on clicking anywhere
        >
         <div className="text-center  border-8 border-yellow-400 p-9 ">
  <p className="text-6xl font-extrabold text-green-500 px-8 py-6 inline-block rounded-lg">
    <strong>Answer</strong>
  </p>
  <p className="text-8xl font-extrabold text-green-500 mt-4">
    {musicName}
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
      {/* <div class="absolute top-4 right-4 flex flex-col space-x-2 space-y-4 sm:space-x-4"><button data-slot="dialog-trigger" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg:not([class*='size-'])]:size-4 shrink-0 [&amp;_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border shadow-xs hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 has-[>svg]:px-3 text-lg sm:text-xl bg-yellow-500 hover:bg-yellow-600 text-black cursor-pointer px-8 py-4" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-«r6»" data-state="closed">Claim</button><button data-slot="button" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg:not([class*='size-'])]:size-4 shrink-0 [&amp;_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border shadow-xs hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 has-[>svg]:px-3 text-lg sm:text-xl bg-yellow-500 hover:bg-yellow-600 text-black cursor-pointer px-8 py-4">Reveal Answer</button></div> */}
      {directoryVideos.length > 0 ? (
        <div className="mt-9 bg-opacity-80 p-4 rounded-lg shadow-lg">
          <div className="absolute mt-26 right-4 flex flex-col sm:flex-row gap-4 mb-4">
            <div className="">
              <div className="flex flex-col gap-4 right-4 space-x-2 space-y-4 sm:space-x-4">
              {/* <Button
      variant="outline"
      onClick={handlePrevVideo}
      className="w-full bg-blue-500 hover:bg-blue-600 text-white cursor-pointer px-8 py-4 text-lg sm:text-xl"
    >
      Previous
    </Button> */}
    
    {!isGameStarted ? (
      <Button
        variant="outline"
        onClick={handleStartGame}
        className="w-full bg-green-500 hover:bg-green-600 text-white cursor-pointer px-8 py-4 text-lg sm:text-xl"
      >
        Start
      </Button>
    ) : (
      <Button
        variant="outline"
        onClick={handleNextWithNumberOverlay}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white cursor-pointer px-8 py-4 text-lg sm:text-xl"
      >
        Next
      </Button>
                )}
                <Button
      variant="outline"
      onClick={handleStartQuiz}
      className="w-full bg-purple-500 hover:bg-purple-600 text-white cursor-pointer px-8 py-4 text-lg sm:text-xl"
    >
      Start Quiz
    </Button>
    <Button
  variant="outline"
  onClick={() => setIsLuckyDrawDialogOpen(true)}
  className="w-full bg-orange-500 hover:bg-orange-600 text-white cursor-pointer px-8 py-4 text-lg sm:text-xl"
>
  Lucky Draw
</Button>
{/* Lucky Draw Dialog */}
<Dialog open={isLuckyDrawDialogOpen} onOpenChange={setIsLuckyDrawDialogOpen}>
  <DialogContent className="sm:max-w-[600px] bg-gray-800 text-white rounded-lg shadow-lg">
    <DialogHeader>
      <DialogTitle className="text-lg font-bold text-yellow-400">Lucky Draw</DialogTitle>
    </DialogHeader>
    <div className="flex flex-col gap-4 py-4">
      <Button
        onClick={handleSelectAllTickets}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 text-lg"
      >
        Select All Tickets
      </Button>
      {allTickets.length > 0 && (
        <div className="text-gray-300">
          <p className="font-bold">Select Tickets:</p>
          <div className="max-h-[300px] overflow-y-auto border border-gray-600 rounded-md p-2">
            <ul className="list-disc ml-6">
              {allTickets.map((ticket, index) => (
                <li key={index} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedTickets.includes(ticket)}
                    onChange={() => handleToggleTicketSelection(ticket)}
                    className="form-checkbox text-yellow-400"
                  />
                  <span>{ticket}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <Button
        onClick={handleStartLuckyDrawForTickets}
        className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 text-lg"
        disabled={selectedTickets.length < 2} // Disable if less than 2 tickets selected
      >
        Start Lucky Draw
      </Button>
    </div>
    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => setIsLuckyDrawDialogOpen(false)}
        className="text-gray-300 border-gray-500 hover:bg-gray-700 px-6 py-3 text-lg"
      >
        Cancel
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>


{/* Lucky Draw Animation Overlay */}
{isLuckyDrawAnimationActive && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div className="text-center">
      <p className="text-6xl font-bold text-yellow-500 border-4 border-yellow-400 px-4 py-2 inline-block rounded-md animate-pulse">
        🎲 {luckyDrawWinningTicket || selectedTickets[Math.floor(Math.random() * selectedTickets.length)]}
      </p>
    </div>
  </div>
)}

{/* Winner Overlay */}
{isCelebrationActive && luckyDrawWinningTicket && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div className="text-center">
      <h1 className="text-6xl font-extrabold text-yellow-500 mb-6 animate-bounce">
        🎉 Ticket No: {luckyDrawWinningTicket} has won! 🎉
      </h1>
      <Button
        onClick={() => {
          setIsCelebrationActive(false);
          setLuckyDrawWinningTicket(null); // Reset the winning ticket
          stopSoundAndAnimation(); // Stop sound and animation
        }}
        className="mt-6 bg-green-500 hover:bg-green-600 text-white px-6 py-3 text-lg"
      >
        Close
      </Button>
    </div>
  </div>
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
                className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50"
                onClick={() => {setIsVideoOverlayActive(false)
                  stopSoundAndAnimation();
                }} // Close overlay on clicking outside
              >
                <div className="relative w-[80%] h-[80%]">
                  {/* Close Button */}
                  {/* <button
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded"
                    onClick={() => setIsVideoOverlayActive(false)} // Close overlay on clicking the button
                  >
                    Close
                  </button> */}
                  <video
                    src={currentVideo}
                    className="w-full h-full rounded-md"
                    controls
                    autoPlay // Automatically play the video
                    onEnded={handleVideoEnd} // Trigger when the video ends
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the video
                  />
                </div>
                {/* Last 3 songs */}
                {usedDirectoryVideos.length > 0 && (
                  <div className="mt-6 w-[80%]">
                    {/* Heading */}
                    <div className="text-center mb-4">
                      <h2 className="text-4xl font-extrabold text-yellow-400 border-b-4 border-yellow-500 inline-block pb-2 drop-shadow-lg">
                        🎵 Last 3 Answers 🎵
                      </h2>
                    </div>
                    {/* Songs List */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {usedDirectoryVideos.slice(-4, -1).map((song, index) => (
                        <div
                          key={index}
                          className="p-6 bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg shadow-xl flex items-center justify-center text-center border-4 border-yellow-500 hover:scale-105 transform transition-transform duration-300"
                        >
                          <p className="text-2xl font-bold text-yellow-300">{song}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}


          {/* Video player */}
          {isGameStarted && currentVideo && !isVideoOverlayActive && (
            <div className="flex justify-center">
              <HeroVideoDialog
                className="rounded-md border border-yellow-500 w-[50%] h-[40%]" // Reduced width and height for a smaller player
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
         {/* Show the last 3 played songs */}
{usedDirectoryVideos.length > 0 && (
  <div className="mt-6">
  {/* Heading */}
  <div className="text-center mb-4">
    <h2 className="text-4xl font-extrabold text-yellow-400 border-b-4 border-yellow-500 inline-block pb-2 drop-shadow-lg">
      🎵 Last 3 Answers  🎵
    </h2>
  </div>

    {/* Songs List */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {usedDirectoryVideos.slice(-4, -1).map((song, index) => (
        <div
          key={index}
          className="p-6 bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg shadow-xl flex items-center justify-center text-center border-4 border-yellow-500 hover:scale-105 transform transition-transform duration-300"
        >
          <p className="text-2xl font-bold text-yellow-300">{song}</p>
        </div>
      ))}
    </div>
  </div>
)}

    </div>
  );
}


