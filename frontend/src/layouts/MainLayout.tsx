import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { RestaurantProvider } from '@/context/RestaurantContext'
import { LoaderCircle } from 'lucide-react'

export default function MainLayout() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <LoaderCircle className="h-24 w-24 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to='/login'
        replace
      />
    )
  }

  return (
    <RestaurantProvider>
      <Outlet />
    </RestaurantProvider>
  )
}