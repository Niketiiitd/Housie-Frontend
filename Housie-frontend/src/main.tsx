import AdminLayout from '@/layouts/admin-layout';
import ManageUser from '@/pages/Admin/ManageUser/manage-user';
import ManageVideos from '@/pages/Admin/ManageVideos/manage-videos';
import ManageSession from '@/pages/Admin/ManageSession/manage-session';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import './index.css';
import LoginForm from './pages/login/login';
import UserLayout from '@/layouts/user-layout';
import UserPage from './pages/User/page';
const router = createBrowserRouter([
  {
    path: '/admin',
    element:<AdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/managevideos" replace />
      },
      {
        path: '/admin/managevideos',
        element: <ManageVideos />
      },
      {
        path: '/admin/manageuser',
        element: <ManageUser />
      },
      {
        path: '/admin/bingoticket',
        element: <ManageSession />
      }
    ]
  },
  {
    path: '/customer',
    element:<UserLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="user" replace />
      },
      {
        path: 'user',
        element: <UserPage />
      },
      
    ]
  },
  
  {
    path: '/login', // Separate route for login
    element: <LoginForm /> // This route does not include the GuestLayout (Header/Footer)
  },
  // {
  //   path: '/signup', // Separate route for register
  //   element: <Register /> // This route does not include the GuestLayout (Header/Footer)
  // },
])


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Root element not found");
}
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* <App /> */}
    <RouterProvider router={router} />

  </React.StrictMode>,
)
