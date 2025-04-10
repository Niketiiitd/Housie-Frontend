import React, { useEffect, useState } from 'react';
import UserHeader from '@/components/User/user-header';
import { Outlet } from 'react-router-dom';

export default function UserLayout() {
  interface Session {
    id: number; // Add other properties if needed
    name: string;
  }

  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    // Fetch session data from the API
    async function fetchSessions() {
      try {
        const response = await fetch('/api/sessions'); // Replace with your API endpoint
        const data = await response.json();
        setSessions(data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    }

    fetchSessions();
  }, []);

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <UserHeader />
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <div style={{ width: '250px', backgroundColor: '#f4f4f4', padding: '1rem' }}>
          <h3>My Sessions</h3>
          <ul>
            {sessions.map((session) => (
              <li
                key={session.id}
                style={{ cursor: 'pointer', marginBottom: '0.5rem' }}
                onClick={() => handleSessionClick(session)}
              >
                {session.name}
              </li>
            ))}
          </ul>
        </div>
        {/* Main Content */}
        <div style={{ flex: 1, padding: '1rem' }}>
          <Outlet context={{ selectedSession }} />
        </div>
      </div>
    </div>
  );
}