import AdminLayout from '@/layouts/admin-layout';
import ManageUser from '@/pages/Admin/ManageUser/manage-user';
import ManageVideos from '@/pages/Admin/ManageVideos/manage-videos';
import BingoTicket from '@/pages/Admin/TicketManage/ticket-manage';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import './index.css';
import LoginForm from './pages/login/login';
const router = createBrowserRouter([
  {
    path: '/',
    element:<AdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="managevideos" replace />
      },
      {
        path: 'managevideos',
        element: <ManageVideos />
      },
      {
        path: 'manageuser',
        element: <ManageUser />
      },
      {
        path: 'bingoticket',
        element: <BingoTicket />
      }
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
