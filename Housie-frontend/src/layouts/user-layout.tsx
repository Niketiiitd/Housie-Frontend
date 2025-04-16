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
      
          <Outlet context={{ selectedSession }} />

    </div>
  );
}