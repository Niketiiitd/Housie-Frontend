import React from 'react';

export default function UserHeader() {
  const handleLogout = () => {
    // Add your logout logic here
    console.log('User logged out');
  };

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#007bff', color: '#fff' }}>
      <h1>User Dashboard</h1>
      <div>
        <a href="/about-us" style={{ marginRight: '1rem', color: '#fff', textDecoration: 'none' }}>
          About Us
        </a>
        <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', backgroundColor: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>
    </header>
  );
}