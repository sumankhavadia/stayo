import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from '../hooks/Usetoast'
import { AuthProvider } from '../features/auth/hooks/useAuth'

export default function AppProviders({ children }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}