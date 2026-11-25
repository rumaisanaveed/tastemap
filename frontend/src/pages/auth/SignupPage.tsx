import { ChangeEvent, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { getErrorMessage } from '@/utils/errorHelper'

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [formValues, setFormValues] = useState({
    username: '',
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({
    username: '',
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
      username: '',
      email: '',
      password: '',
    }

    if (!formValues.username.trim()) {
      newErrors.username = 'Username is required'
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

      await signup({
        name: formValues.username.trim(),
        email: formValues.email.trim().toLowerCase(),
        password: formValues.password,
      })

      toast.success(
        'Account created successfully.'
      )
      navigate("/login")
    } catch(error) {
      toast.error(
        getErrorMessage(
          error,
          'Unable to create account. Please try again.'
        )
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <h1 className="text-title">Welcome to TasteMap</h1>

      <p className="text-sm text-gray-600">
        Register your account & enjoy using TasteMap :)
      </p>

      <div>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          name="username"
          value={formValues.username}
          placeholder="John Doe"
          autoComplete="username"
          onChange={handleChange}
          aria-invalid={!!errors.username}
          maxLength={30}
        />

        {errors.username && (
          <p className="mt-1 text-[13px] font-medium text-destructive">
            {errors.username}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          name="email"
          autoComplete="email"
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
          autoComplete="new-password"
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
        {isSubmitting ? 'Creating account...' : 'Sign up'}
      </Button>

      <p className="meta text-center text-muted-foreground">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-primary transition-colors hover:underline"
        >
          Login
        </Link>
      </p>
    </form>
  )
}