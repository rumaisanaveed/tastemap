import { useState } from 'react'
import { LogOut, LoaderCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import Logo from './Logo'

export default function AppHeader() {
  const { logout: logoutUser } = useAuth()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const logout = async () => {
    if (isLoggingOut) return

    try {
      setIsLoggingOut(true)
      await logoutUser()
      navigate('/login', { replace: true })
    } catch {
      toast.error("Logout failed. Please try again.")
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <Logo />

      <Button
        variant="ghost"
        size="icon"
        aria-label="Log out"
        title="Log out"
        className="size-10"
        onClick={logout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <LoaderCircle className="animate-spin" />
        ) : (
          <LogOut />
        )}
      </Button>
    </div>
  )
}