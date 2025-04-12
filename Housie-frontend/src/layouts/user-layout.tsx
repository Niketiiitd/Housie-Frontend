import React, { useState } from 'react';
import UserHeader from '@/components/User/user-header';
import { Outlet } from 'react-router-dom';

export default function UserLayout() {
  interface Session {
    id: number;
    name: string;
  }

  // Hardcoded session data for testing
  const hardcodedSessions: Session[] = [
    { id: 1, name: 'Session 1' },
    { id: 2, name: 'Session 2' },
    { id: 3, name: 'Session 3' },
  ];

  const [sessions] = useState<Session[]>(hardcodedSessions);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

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