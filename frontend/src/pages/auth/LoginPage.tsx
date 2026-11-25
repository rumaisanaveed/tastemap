import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { getErrorMessage } from '@/utils/errorHelper'
import axios from 'axios'
import { ChangeEvent, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({
    email: '',
    password: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }))

    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const newErrors = {
      email: '',
      password: '',
    }

    if (!formValues.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email.trim())
    ) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formValues.password.trim()) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)

    if (Object.values(newErrors).some(Boolean)) return

    try {
      setIsSubmitting(true)

      await login({
        email: formValues.email.trim().toLowerCase(),
        password: formValues.password,
      })

      toast.success("Login successfully.")
      navigate('/')
    } catch (error) {
         toast.error(
            getErrorMessage(error, 'Unable to log in. Please try again.')
          )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <h1 className="text-title">Welcome back to TasteMap</h1>

      <p className="text-sm text-gray-600">
        Enter your registered email and password to continue
      </p>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          name="email"
          value={formValues.email}
          placeholder="johndoe@gmail.com"
          onChange={handleChange}
          aria-invalid={!!errors.email}
        />

        {errors.email && (
          <p className="mt-1 text-[13px] font-medium text-destructive">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formValues.password}
          placeholder="Enter password"
          onChange={handleChange}
          aria-invalid={!!errors.password}
        />

        {errors.password && (
          <p className="mt-1 text-[13px] font-medium text-destructive">
            {errors.password}
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>

      <p className="meta text-center text-muted-foreground">
        Don't have an account?{' '}
        <Link
          to="/signup"
          className="font-semibold text-primary transition-colors hover:underline"
        >
          Sign up
        </Link>
      </p>
    </form>
  )
}
