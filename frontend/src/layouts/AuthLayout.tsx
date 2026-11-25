import Logo from '@/components/custom/Logo'
import { useAuth } from '@/context/AuthContext'
import { LoaderCircle } from 'lucide-react'
import { Navigate, Outlet } from 'react-router-dom'

export default function AuthLayout() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoaderCircle className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-5">
      <div
        aria-hidden
        className="absolute -left-24 -top-24 size-96 rounded-full bg-butter/60"
      />

      <div
        aria-hidden
        className="absolute -bottom-32 -right-20 size-[28rem] rounded-full bg-sky/70"
      />

      <div className="relative w-full max-w-sm rounded-3xl bg-background p-8 ring-1 ring-border">
        <Logo className="mb-6 text-3xl" />
        <Outlet />
      </div>
    </div>
  )
}