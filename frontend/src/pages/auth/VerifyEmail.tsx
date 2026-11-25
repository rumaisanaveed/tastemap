import { resendVerificationEmail } from '@/api/authApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { getErrorMessage } from '@/utils/errorHelper'
import { ArrowLeft, LoaderCircle, Mail, RefreshCw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  Link,
  Navigate,
  useLocation,
  useSearchParams
} from 'react-router-dom'
import { toast } from 'sonner'

export default function VerifyEmailPage() {
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const { verifyEmail, user } = useAuth()

  const token = searchParams.get('token')

  const signupEmail =
    (location.state as { email?: string } | null)?.email || ''

  const initialEmail = signupEmail || user?.email || ''

  const [email, setEmail] = useState(initialEmail)
  const [countdown, setCountdown] = useState(
    !token && signupEmail ? 60 : 0
  )
  const [isVerifying, setIsVerifying] = useState(!!token)
  const [isResending, setIsResending] = useState(false)
  const [verificationError, setVerificationError] = useState('')

  const verificationStarted = useRef<string | null>(null)

  useEffect(() => {
    if (!token || verificationStarted.current === token) return

    verificationStarted.current = token

    const verify = async () => {
      try {
        await verifyEmail(token)
      } catch (error) {
        setVerificationError(
          getErrorMessage(
            error,
            'This verification link is invalid or has expired. Please request a new one.'
          )
        )
      } finally {
        setIsVerifying(false)
      }
    }

    verify()
  }, [token, verifyEmail])

  useEffect(() => {
    if (countdown <= 0) return

    const timer = window.setInterval(() => {
      setCountdown((prev) => Math.max(prev - 1, 0))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [countdown])

  const handleResend = async () => {
    if (!email.trim() || countdown > 0 || isResending) return

    try {
      setIsResending(true)
      const response = await resendVerificationEmail(email.trim())
      toast.success(
        response.message || 'A new verification email has been sent.'
      )
      setCountdown(60)
      setVerificationError('')
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          'Unable to resend the verification email. Please try again.'
        )
      )
    } finally {
      setIsResending(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="space-y-5 py-4 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-sky/40">
          <LoaderCircle className="size-8 animate-spin text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-title">Verifying your email</h1>
          <p className="text-sm text-muted-foreground">
            Just a moment! We're confirming your email address.
          </p>
        </div>
      </div>
    )
  }

  if (!token && !email) {
    return <Navigate to="/signup" replace />
  }

  const minutes = Math.floor(countdown / 60)
  const seconds = countdown % 60

  return (
    <div className="space-y-5 py-2 text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-butter">
        <Mail className="size-8 text-foreground" />
      </div>

      <div className="space-y-2">
        <h1 className="text-title">
          {verificationError
            ? 'Verification unsuccessful'
            : 'Check your inbox!'}
        </h1>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {verificationError ||
            (email
              ? 'We have sent a verification link to your email address. Please check your inbox and click the link to activate your TasteMap account.'
              : 'Enter your registered email address below to request a verification link.')}
        </p>
      </div>

      {email ? (
        <div className="rounded-xl bg-muted/60 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {signupEmail
              ? 'Verification email sent to'
              : 'Account email'}
          </p>
          <p className="mt-1 break-all text-sm font-semibold text-foreground">
            {email}
          </p>
        </div>
      ) : (
        <div className="space-y-2 text-left">
          <Label htmlFor="verification-email">Email address</Label>
          <Input
            id="verification-email"
            type="email"
            placeholder="johndoe@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      )}

      <div className="space-y-3 pt-2">
        <Button
          type="button"
          className="w-full"
          size="lg"
          disabled={!email.trim() || countdown > 0 || isResending}
          onClick={handleResend}
        >
          {isResending ? (
            <>
              <LoaderCircle className="mr-2 size-4 animate-spin" />
              Sending email...
            </>
          ) : countdown > 0 ? (
            <>
              <RefreshCw className="mr-2 size-4" />
              Resend available in {String(minutes).padStart(2, '0')}:
              {String(seconds).padStart(2, '0')}
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 size-4" />
              Resend verification email
            </>
          )}
        </Button>

        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to login
        </Link>
      </div>

      <p className="text-xs text-muted-foreground">
        Don't forget to check your spam or junk folder.
      </p>
    </div>
  )
}