import AdminHeader from '@/components/Admin/admin-header'
import { Outlet } from 'react-router-dom'
// import Footer from './components/Footer/Footer'
export default function AdminLayout() {
  return (
    <>
    <AdminHeader />
    <Outlet />
    {/* <Footer /> */}
    </>
  )
}
