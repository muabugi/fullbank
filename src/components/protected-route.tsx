import { useAuth } from '@/contexts/auth-context'

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    // Use Next.js redirect logic instead of <Navigate />
    // For example:
    // if (typeof window !== 'undefined') {
    //   window.location.href = '/login'
    // }
    return null // Or a loading spinner, depending on desired behavior
  }

  // If authenticated, render the child routes
  return null // Or <Outlet />, depending on desired behavior
} 