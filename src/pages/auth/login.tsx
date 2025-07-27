import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import Link from "next/link"
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/router'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    console.log('[Login] Submitting login form', { email });
    try {
      await login({ email, password })
      console.log('[Login] Login successful');
      // The toast and navigation are handled in the auth context
    } catch (err: any) {
      const backendMsg = err?.response?.data?.message || err?.message || 'Failed to login. Please try again.';
      setError(backendMsg)
      console.error('[Login] Login error:', err);
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: backendMsg,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border border-gray-300 dark:border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200 border border-gray-300 dark:border-gray-700 shadow"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
          <Link href="/forgot-password" className="text-sm text-primary hover:underline text-center">
            Forgot your password?
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
} 