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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useVideoContext } from '@/VideoContext';
import { useCallback, useEffect, useState } from 'react';

export default function UserPage() {
  const { videoPaths, getRandomVideoPath } = useVideoContext();
  const [usedVideos, setUsedVideos] = useState<string[]>([]);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [jsonData, setJsonData] = useState<Record<string, any> | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [ticketNumber, setTicketNumber] = useState('');
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [isPrizeDialogOpen, setIsPrizeDialogOpen] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState('');
  const [isCelebrationActive, setIsCelebrationActive] = useState(false);
  const [musicName, setMusicName] = useState('');
  const [videoMapping, setVideoMapping] = useState<Record<string, string>>({}); // Map video names to paths

  useEffect(() => {
    console.log('Initializing JSON data and video paths...');
    setJsonData(jsonData); // Ensure JSON is set correctly
    console.log('videoPaths:', videoPaths);

    // Create a mapping of video names to paths
    const mapping: Record<string, string> = {};
    videoPaths.forEach((path) => {
      const videoName = path.split('/').pop()?.split('.')[0] || ''; // Extract video name
      mapping[videoName] = path;
    });
    setVideoMapping(mapping);
    console.log('Video mapping:', mapping);
    console.log('JSON data loaded:', jsonData);
  }, [videoPaths]);
  useEffect(() => {
    console.log("json" , jsonData);
  }
  );

  const handleCheckTicket = () => {
    console.log('Checking ticket with number:', ticketNumber);
    setIsTicketDialogOpen(false);
    setIsPrizeDialogOpen(true);
  };

  const handleClaimPrize = () => {
    console.log('Claiming prize:', selectedPrize);
    setIsPrizeDialogOpen(false);
    setIsCelebrationActive(true);
    // const audio = new Audio('/path/to/celebration-sound.mp3'); // Update path
    // audio.play().catch((error) => {
    //   console.error('Error playing audio:', error); // Handle audio playback errors
    // });
  };

  const handleCancelCelebration = () => {
    console.log('Cancelling celebration...');
    setIsCelebrationActive(false);
  };

  const handleShowMusicName = () => {
    console.log('Showing music name...');
    setMusicName('Sample Music Name'); // Hardcoded music name
    console.log('Music name:', musicName);
  };

  const handleNextVideo = useCallback(() => {
    console.log('Fetching next video...');
    if (Object.keys(videoMapping).length === usedVideos.length) {
      console.log('All videos have been used.');
      alert('All videos have been used.');
      return;
    }

    let newVideoName;
    do {
      const randomIndex = Math.floor(Math.random() * Object.keys(videoMapping).length);
      newVideoName = Object.keys(videoMapping)[randomIndex];
    } while (usedVideos.includes(newVideoName));

    console.log('Selected video:', newVideoName);
    setUsedVideos([...usedVideos, newVideoName]);
    setCurrentVideo(videoMapping[newVideoName]);

    // Check JSON mapping for the selected video
    if (jsonData && jsonData[newVideoName]) {
      console.log('Associated question from JSON:', jsonData[newVideoName].question);
      setCurrentQuestion(jsonData[newVideoName].question || null);
    } else {
      console.log('No question found in JSON for video:', newVideoName);
      setCurrentQuestion(null);
    }
  }, [videoMapping, usedVideos, jsonData]);

  return (
    <div className="p-6 relative">
      <h1 className="text-2xl font-bold mb-4">User Page</h1>

      {/* Top Buttons: Claim and Show */}
      <div className="absolute top-6 right-6 flex space-x-4">
        <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Claim</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Claim Ticket</DialogTitle>
              <DialogDescription>
                Enter your ticket number below and click "Check" to continue.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ticketNumber" className="text-right">
                  Ticket Number
                </Label>
                <Input
                  id="ticketNumber"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCheckTicket}>Check</Button>
              <Button variant="outline" onClick={() => setIsTicketDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Show Button */}
        <Button variant="outline" onClick={handleShowMusicName}>
          Show
        </Button>
      </div>

      {/* Music Name Display */}
      {musicName && <p className="mt-2 text-gray-700">Music Name: {musicName}</p>}

      {/* Prize Selection Dialog */}
      <Dialog open={isPrizeDialogOpen} onOpenChange={setIsPrizeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select a Prize</DialogTitle>
            <DialogDescription>
              Here's your ticket! Choose a prize to claim.
            </DialogDescription>
          </DialogHeader>

          {/* Static Ticket Image */}
          <div className="w-full flex justify-center my-4">
            <img
              src="/path/to/ticket-image.jpg"
              alt="Ticket"
              className="max-w-xs rounded-lg border"
            />
          </div>

          {/* Prize Dropdown */}
          <Select onValueChange={setSelectedPrize}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a prize to claim" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="First Row">First Row</SelectItem>
              <SelectItem value="Full House">Full House</SelectItem>
              <SelectItem value="Corners">Corners</SelectItem>
            </SelectContent>
          </Select>

          <DialogFooter className="mt-4">
            {selectedPrize && (
              <Button onClick={handleClaimPrize}>Claim {selectedPrize}</Button>
            )}
            <Button variant="outline" onClick={() => setIsPrizeDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Celebration Overlay */}
      {isCelebrationActive && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">🎉 Congratulations! 🎉</h1>
            <div className="w-full flex justify-center my-4">
              <img
                src="/path/to/ticket-image.jpg"
                alt="Ticket"
                className="max-w-xs rounded-lg border"
              />
            </div>
            <p className="text-lg font-semibold text-white mb-4">
              Prize: {selectedPrize}
            </p>
            <div className="animate-bounce text-6xl">🏆</div>
            <Button
              variant="outline"
              className="mt-4"
              onClick={handleCancelCelebration}
            >
              Stop Celebration
            </Button>
          </div>
        </div>
      )}

      {/* Video Section */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Video Player</h3>
        {currentVideo ? (
          <div>
            <video controls className="w-full rounded-md">
              <source src={currentVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {currentQuestion && (
              <p className="mt-4 text-gray-700">
                <strong>Question:</strong> {currentQuestion}
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No video selected. Click "Next" to start.</p>
        )}
      </div>

      {/* Display JSON Data */}
      {jsonData && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Loaded Data</h3>
          <div className="space-y-4">
            {Object.entries(jsonData).map(([videoName, content], index) => {
              console.log('Mapping JSON data for video:', videoName, content);
              return (
                <div key={index} className="p-4 border rounded-md">
                  <h4 className="font-bold">{videoName}</h4>
                  <p className="mt-2">
                    <strong>Question:</strong>{' '}
                    {typeof content.question === 'string' ? (
                      content.question
                    ) : (
                      <audio controls src={content.question}></audio>
                    )}
                  </p>
                  <p className="mt-2">
                    <strong>Answer:</strong>{' '}
                    {typeof content.answer === 'string' ? (
                      content.answer
                    ) : (
                      <audio controls src={content.answer}></audio>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-4">
        <Button variant="outline">Prev</Button>
        <Button variant="outline" onClick={handleNextVideo}>
          Next
        </Button>
      </div>
    </div>
  );
}