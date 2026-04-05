import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import ListingsPage from '../features/listings/pages/ListingsPage'
import ListingDetails from '../features/listings/pages/ListingDetails'
import CreateListing from '../features/listings/pages/CreateListing'
import EditListing from '../features/listings/pages/EditListing'
import Login from '../features/auth/pages/Login'
import Signup from '../features/auth/pages/Signup'
import { useAuth } from '../features/auth/hooks/useAuth'

function RequireAuth({ children }) {
  const { currentUser, loadingAuth } = useAuth()
  if (loadingAuth) return null
  if (!currentUser) return <Navigate to='/login' replace />
  return children
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path='/' element={<Navigate to='/listings' replace />} />
        <Route path='/listings' element={<ListingsPage />} />
        <Route path='/listings/new' element={<RequireAuth><CreateListing /></RequireAuth>} />
        <Route path='/listings/:id' element={<ListingDetails />} />
        <Route path='/listings/:id/edit' element={<RequireAuth><EditListing /></RequireAuth>} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
      </Route>
    </Routes>
  )
}