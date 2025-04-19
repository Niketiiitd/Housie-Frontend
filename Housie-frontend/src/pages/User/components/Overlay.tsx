import { useEffect, useState } from 'react';
import ticketData from '/Users/niketagarwal/Desktop/Github repo/Housie-Frontend/Housie-frontend/ticket.json';

interface Ticket {
  id: number;
  eventId: number;
  numbers: string[];
  createdAt: string;
}

interface OverlayProps {
  ticketNumber: string;
  currentSong: string | null;
}

export default function Overlay({ ticketNumber, currentSong }: OverlayProps) {
  const [isWinner, setIsWinner] = useState<boolean | null>(null);

  useEffect(() => {
    if (!ticketNumber || !currentSong) {
      setIsWinner(null);
      return;
    }

    // Check if the ticket has won
    const ticket = ticketData.find((t: Ticket) => t.id === parseInt(ticketNumber, 10));
    if (ticket && ticket.numbers.includes(currentSong)) {
      setIsWinner(true);
    } else {
      setIsWinner(false);
    }
  }, [ticketNumber, currentSong]);

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        {isWinner === null ? (
          <p className="text-gray-700">No ticket or song selected.</p>
        ) : isWinner ? (
          <p className="text-green-500 font-bold text-lg">🎉 Congratulations! Your ticket has won! 🎉</p>
        ) : (
          <p className="text-red-500 font-bold text-lg">❌ Sorry, your ticket did not win. ❌</p>
        )}
      </div>
    </div>
  );
}
