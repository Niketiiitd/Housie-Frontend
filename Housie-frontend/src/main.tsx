import ErrorBoundary from '@/components/ErrorBoundary';
import AdminLayout from '@/layouts/admin-layout';
import UserLayout from '@/layouts/user-layout';
import ManageSession from '@/pages/Admin/ManageSession/manage-session';
import ManageUser from '@/pages/Admin/ManageUser/manage-user';
import ManageVideos from '@/pages/Admin/ManageVideos/manage-videos';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import UserPage from './pages/User/page';
import { VideoProvider } from './VideoContext';
import LicenseChecker from '@/components/LicenseChecker'; // Import LicenseChecker
// Define the App component with HashRouter
function App() {
  return (
    <HashRouter>
      {/* <LicenseChecker> */}
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/managevideos" replace />} />
          <Route path="managevideos" element={<ManageVideos />} />
          <Route path="manageuser" element={<ManageUser />} />
          <Route path="bingoticket" element={<ManageSession />} />
        </Route>
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Navigate to="user" replace />} />
          <Route path="user" element={<UserPage />} />
        </Route>
        {/* Uncomment if LoginForm is needed as a separate route */}
        {/* <Route path="/login" element={<LoginForm />} /> */}
      </Routes>
      {/* </LicenseChecker> */}
    </HashRouter>
  );
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <VideoProvider>
      <App />
    </VideoProvider>
  </React.StrictMode>,
);