import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import Toast from '../components/Toast'

export default function MainLayout() {
  return (
    <div className="wrapper">
      <Navbar />
      <main className="main-content">
        <Toast />
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}