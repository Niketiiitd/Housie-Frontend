import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import React, { useRef, useState } from 'react';
// import backgroundImage from '../assets/your-image.jpg';

interface VideoEntry {
  file: File;
  url: string;
  name: string;
}

interface QuizEntry {
  file: File;
  url: string;
  name: string;
}

interface UserHeaderProps {
  onDirectoryVideosChange?: (videos: VideoEntry[]) => void;
  onVideoStatusChange?: (status: string) => void;
  onQuizDirectoryChange?: (quizFiles: QuizEntry[]) => void; // Added prop for quiz directory
  onModeChange?: (isSequential: boolean) => void; // Add callback for mode change
  onTicketDataChange?: (ticketData: any) => void; // Add callback for ticket data
  onQuizDataChange?: (quizData: any) => void; // Add callback for quiz data
  onPrizeQuotaChange?: (prizes: { prize: string; quota: number }[]) => void; // Updated prop to handle multiple prize entries.
}

export default function UserHeader({ 
  onDirectoryVideosChange, 
  onVideoStatusChange, 
  onQuizDirectoryChange, 
  onModeChange, 
  onTicketDataChange, 
  onQuizDataChange,
  onPrizeQuotaChange,
  
}: UserHeaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false); // State for quiz dialog
  const directoryInputRef = useRef<HTMLInputElement>(null);
  const quizInputRef = useRef<HTMLInputElement>(null); // Ref for quiz input
  const [isSequentialMode, setIsSequentialMode] = useState(false); // Track if sequential mode is active
  const ticketInputRef = useRef<HTMLInputElement>(null); // Ref for ticket data input
  const quizDataInputRef = useRef<HTMLInputElement>(null); // Ref for quiz data input
  const [selectedPrizeType, setSelectedPrizeType] = useState<string>('1st Row'); // New states for prize quota input
  const [quotaValue, setQuotaValue] = useState<number>(1);
  const [isPrizeDialogOpen, setIsPrizeDialogOpen] = useState(false); // NEW: state for Prize Dialog
  const [prizeQuotas, setPrizeQuotas] = useState<{ prize: string; quota: number }[]>([]); // NEW: state to hold multiple prize entries

  // List of all available prizes
  const allPrizes = ['1st Row', '2nd Row', '3rd Row', 'Full House', 'Quick 5', 'Quick 7', 'default'];

  // Filter out already added prizes
  const availablePrizes = allPrizes.filter(
    (prize) => !prizeQuotas.some((entry) => entry.prize === prize)
  );

  const toggleMode = (mode: 'random' | 'sequential') => {
    const isSequential = mode === 'sequential';
    setIsSequentialMode(isSequential);
    // console.log(`Switched to ${isSequential ? 'Sequential ' : 'Random'} mode`);
    onModeChange?.(isSequential); // Ensure this updates the parent state
    onVideoStatusChange?.(`Switched to ${isSequential ? 'Sequential' : 'Random'} mode`);
    onDirectoryVideosChange?.([]); // Reset videos if needed
  };

  const handleDirectorySelect = async () => {
    try {
      // @ts-ignore - TypeScript doesn't know about showDirectoryPicker yet
      const directoryHandle = await window.showDirectoryPicker();
      const videos: VideoEntry[] = [];
      
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
      
      console.log('Extracted video files:', videos); // Log the list of video files
      onDirectoryVideosChange?.(videos);
      onVideoStatusChange?.(`Loaded ${videos.length} videos from directory`);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error accessing directory:', error);
      onVideoStatusChange?.('Error accessing directory');
    }
  };

  const handleDirectoryInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
      .filter(file => file.type.startsWith('video/') || 
              file.name.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i));
    
    const videos = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    
    onDirectoryVideosChange?.(videos);
    onVideoStatusChange?.(`Loaded ${videos.length} videos from directory`);
    setIsDialogOpen(false);
  };

  const handleQuizDirectorySelect = async () => {
    try {
      // @ts-ignore - TypeScript doesn't know about showDirectoryPicker yet
      const directoryHandle = await window.showDirectoryPicker();
      const quizFiles: QuizEntry[] = [];

      for await (const entry of directoryHandle.values()) {
        if (
          entry.kind === 'file' &&
          entry.name.match(/\.(mp4|webm|ogg|mov|avi|mkv|jpg|jpeg|png|gif|mp3|wav)$/i)
        ) {
          const file = await entry.getFile();
          const url = URL.createObjectURL(file);
          quizFiles.push({
            file,
            url,
            name: file.name,
          });
        }
      }

      // Debugging: Log the list of quiz files and their count
      console.log('Quiz Directory Selected:', quizFiles);
      console.log('Total Quiz Files:', quizFiles.length);

      onQuizDirectoryChange?.(quizFiles); // Pass quiz files to parent
      onVideoStatusChange?.(`Loaded ${quizFiles.length} quiz files from directory`);
      setIsQuizDialogOpen(false);
    } catch (error) {
      console.error('Error accessing quiz directory:', error);
      onVideoStatusChange?.('Error accessing quiz directory');
    }
  };

  const handleQuizInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).filter(file =>
      file.name.match(/\.(mp4|webm|ogg|mov|avi|mkv|jpg|jpeg|png|gif|mp3|wav)$/i)
    );

    const quizFiles = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    onQuizDirectoryChange?.(quizFiles);
    onVideoStatusChange?.(`Loaded ${quizFiles.length} quiz files from directory`);
    setIsQuizDialogOpen(false);
  };

  const handleTicketDataChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const ticketData = JSON.parse(reader.result as string);
          onTicketDataChange?.(ticketData);
        } catch (error) {
          console.error('Error parsing ticket data JSON:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleQuizDataChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const quizData = JSON.parse(reader.result as string);
          onQuizDataChange?.(quizData);
        } catch (error) {
          console.error('Error parsing quiz data JSON:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleAddPrize = () => {
    if (!selectedPrizeType || quotaValue <= 0) {
      alert('Please select a valid prize and enter a positive quota value.');
      return;
    }
  
    const newPrize = { prize: selectedPrizeType, quota: quotaValue };
    setPrizeQuotas((prevPrizes) => [...prevPrizes, newPrize]); // Update local state
    onPrizeQuotaChange?.([...prizeQuotas, newPrize]); // Update parent state
    setSelectedPrizeType(''); // Reset dropdown
    setQuotaValue(1); // Reset input
  };
  
  const handleRemovePrize = (index: number) => {
    const updatedPrizes = prizeQuotas.filter((_, i) => i !== index);
    setPrizeQuotas(updatedPrizes); // Update local state
    onPrizeQuotaChange?.(updatedPrizes); // Update parent state
  };

  return (
    <header className="flex justify-between items-center p-4 bg-blue-600 text-white">
      <h1 className="text-xl font-bold">Housie King</h1>
      <div className="flex items-center space-x-4">
        <a href="/about-us" className="text-white hover:underline">
          About Us
        </a>

        {/* Video Directory Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
              Choose Video Directory
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-yellow-400">Select Video Directory</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => directoryInputRef.current?.click()}
                  className="w-full bg-gray-700 text-white hover:bg-gray-600"
                >
                  Select Directory (Fallback)
                </Button>
                <input
                  type="file"
                  ref={directoryInputRef}
                  onChange={handleDirectoryInputChange}
                  style={{ display: 'none' }}
                  // @ts-ignore - webkitdirectory is not in the type definitions
                  webkitdirectory=""
                  directory=""
                  multiple
                  accept="video/*"
                />
              </div>
              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={() => toggleMode('random')}
                  className={`w-[48%] bg-blue-500 hover:bg-blue-600 text-white ${!isSequentialMode ? 'opacity-100' : 'opacity-50'}`}
                >
                  Random
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toggleMode('sequential')}
                  className={`w-[48%] bg-purple-500 hover:bg-purple-600 text-white ${isSequentialMode ? 'opacity-100' : 'opacity-50'}`}
                >
                  Sequential
                </Button>
              </div>
            </div>
            <DialogFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="text-yellow-500 bg-gray-700 hover:bg-gray-500"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Quiz Directory Dialog */}
        <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded">
              Choose Quiz Directory
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-yellow-400">Select Quiz Directory</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => quizInputRef.current?.click()}
                  className="w-full bg-gray-700 text-white hover:bg-gray-600"
                >
                  Select Directory (Fallback)
                </Button>
                <input
                  type="file"
                  ref={quizInputRef}
                  onChange={handleQuizInputChange}
                  style={{ display: 'none' }}
                  // @ts-ignore - webkitdirectory is not in the type definitions
                  webkitdirectory=""
                  directory=""
                  multiple
                  accept="video/*,image/*,audio/*"
                />
              </div>
            </div>
            <DialogFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsQuizDialogOpen(false)}
                className="text-yellow-500 bg-gray-700 hover:bg-gray-5000"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Ticket Data Upload */}
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
          onClick={() => ticketInputRef.current?.click()}
        >
          Upload Ticket Data
        </Button>
        <input
          type="file"
          ref={ticketInputRef}
          onChange={handleTicketDataChange}
          style={{ display: 'none' }}
          accept="application/json"
        />

        {/* Quiz Data Upload */}
        <Button
          className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded"
          onClick={() => quizDataInputRef.current?.click()}
        >
          Upload Quiz Data
        </Button>
        <input
          type="file"
          ref={quizDataInputRef}
          onChange={handleQuizDataChange}
          style={{ display: 'none' }}
          accept="application/json"
        />

        {/* Prize Quota Trigger Button */}
        <Button
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
          onClick={() => setIsPrizeDialogOpen(true)}
        >
          Set Prize Quota
        </Button>

        {/* Prize Quota Dialog */}
        <Dialog open={isPrizeDialogOpen} onOpenChange={setIsPrizeDialogOpen}>
          <DialogTrigger asChild>
            {/* Invisible trigger as the button above opens the dialog */}
            <span className="hidden" />
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-yellow-400">Set Prize Quota</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              {/* Prize Selection */}
              <select 
                value={selectedPrizeType} 
                onChange={(e) => setSelectedPrizeType(e.target.value)}
                className="bg-gray-600 text-white p-1 rounded"
              >
                <option value="" disabled>Select Prize</option>
                {availablePrizes.map((prize) => (
                  <option key={prize} value={prize}>
                    {prize}
                  </option>
                ))}
              </select>
              <input 
                type="number"
                min="1"
                value={quotaValue} 
                onChange={(e) => setQuotaValue(Number(e.target.value))}
                className="w-full p-1 rounded text-black"
                placeholder="Enter quantity"
              />
              <Button
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
                onClick={handleAddPrize}
                disabled={!selectedPrizeType} // Disable if no prize is selected
              >
                Add
              </Button>

              {/* Display Added Prizes */}
              <div className="flex flex-col gap-2">
                {prizeQuotas.map((prize, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-gray-700 p-2 rounded"
                  >
                    <span>{prize.prize} - {prize.quota}</span>
                    <Button
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                      onClick={() => handleRemovePrize(index)}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsPrizeDialogOpen(false)}
                className="text-yellow-500 bg-gray-700 hover:bg-gray-500"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}