import React from 'react';
import { useOutletContext } from 'react-router-dom';

interface Session {
  id: number; // Add other properties if needed
  name: string;
}

interface OutletContext {
  selectedSession: Session | null;
}

export default function UserPage() {
  const { selectedSession } = useOutletContext<OutletContext>();

  return (
    <div>
      <h1>User Page</h1>
      {selectedSession ? (
        <div>
          <h2>Selected Session</h2>
          <p>Session Name: {selectedSession.name}</p>
          {/* Add more details about the session if needed */}
        </div>
      ) : (
        <p>Please select a session from the sidebar.</p>
      )}
    </div>
  );
}