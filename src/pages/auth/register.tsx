import { useState, useEffect } from 'react'
import Link from "next/link"
import { api } from '../../api'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/auth-context'

export default function Register() {
  const { isAuthenticated } = useAuth()
  const router = useRouter();
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
  })
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('');
    setIsLoading(true)
    console.log('[Register] Submitting registration form', formData);

    if (formData.password !== formData.password2) {
      setError('Passwords do not match');
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }

    try {
      console.log('[Register] Sending registration request...');
      const response = await api.post('/api/auth/register', {
        email: formData.email,
        password: formData.password,
        name: `${formData.first_name} ${formData.last_name}`
      })
      console.log('[Register] Registration successful', response.data);
      toast({
        title: 'Success',
        description: 'Registration successful. Please sign in.',
      })
      router.push('/auth/login')
    } catch (error: any) {
      const backendMsg = error?.response?.data?.message || error?.message || 'Registration failed';
      setError(backendMsg);
      console.error('[Register] Registration error:', error);
      toast({
        title: 'Error',
        description: backendMsg,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r"
        style={{ backgroundImage: "url('/stock1.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-zinc-900/10" />
        <div className="relative z-20 h-full flex flex-col">
          <div className="flex items-center text-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            Banking App
          </div>
          <div className="mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                "This banking platform has transformed how I manage my finances. The interface is intuitive and the features are exactly what I need."
              </p>
              <footer className="text-sm">Sofia Davis</footer>
            </blockquote>
          </div>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Card className="w-full max-w-2xl border border-gray-300 dark:border-gray-700 shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Create an account</CardTitle>
              <CardDescription className="text-center">
                Enter your information to create your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm">{error}</div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First name</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      type="text"
                      placeholder="John"
                      required
                      value={formData.first_name}
                      onChange={handleChange}
                      className="border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last name</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      type="text"
                      placeholder="Doe"
                      required
                      value={formData.last_name}
                      onChange={handleChange}
                      className="border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password2">Confirm password</Label>
                  <Input
                    id="password2"
                    name="password2"
                    type="password"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    required
                    value={formData.password2}
                    onChange={handleChange}
                    className="border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <Button
                  className="w-full bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200 border border-gray-300 dark:border-gray-700 shadow"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Create account'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-muted-foreground text-center">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
} 