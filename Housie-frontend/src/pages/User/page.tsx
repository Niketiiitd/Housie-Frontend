import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
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
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

interface Session {
  id: number;
  name: string;
}

interface OutletContext {
  selectedSession: Session | null;
}

export default function UserPage() {
  const { selectedSession } = useOutletContext<OutletContext>();
  const [ticketNumber, setTicketNumber] = useState('');
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [isPrizeDialogOpen, setIsPrizeDialogOpen] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState('');
  const [isCelebrationActive, setIsCelebrationActive] = useState(false);
  const [musicName, setMusicName] = useState(''); // State to store the music name

  const handleCheckTicket = () => {
    setIsTicketDialogOpen(false);
    setIsPrizeDialogOpen(true);
  };

  const handleClaimPrize = () => {
    setIsPrizeDialogOpen(false);
    setIsCelebrationActive(true);
    const audio = new Audio('/path/to/celebration-sound.mp3'); // Update path
    audio.play();
  };

  const handleCancelCelebration = () => {
    setIsCelebrationActive(false);
  };

  const handleShowMusicName = () => {
    setMusicName('Sample Music Name'); // Hardcoded music name
  };

  return (
    <div className="p-6 relative">
      <h1 className="text-2xl font-bold mb-4">User Page</h1>
      {selectedSession ? (
        <div>
          <h2 className="text-xl font-semibold mb-2">Selected Session</h2>
          <p className="mb-4">Session Name: {selectedSession.name}</p>

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
            <video controls className="w-full rounded-md">
              <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-4">
            <Button variant="outline">Prev</Button>
            <Button variant="outline">Next</Button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Please select a session from the sidebar.</p>
      )}
    </div>
  );
}