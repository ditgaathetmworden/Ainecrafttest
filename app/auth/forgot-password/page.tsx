'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, ArrowLeft, KeyRound, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setIsLoading(true)

    try {
      await sendPasswordResetEmail(auth, email)
      setIsSent(true)
    } catch (err: any) {
      console.error('Password reset helper failed:', err)
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address')
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format')
      } else {
        setError(err.message || 'Failed to send password reset email. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background justify-center py-10 px-6">
      <div className="max-w-md mx-auto w-full">
        {/* Back Button */}
        <button
          onClick={() => router.push('/auth/login')}
          className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl bg-obsidian-card border border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Header */}
        <header className="text-center pb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neon/10">
            <KeyRound className="h-8 w-8 text-neon" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Reset Password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isSent 
              ? "We've sent reset instructions to your email." 
              : "Enter your email to receive a password reset link."
            }
          </p>
        </header>

        {/* Form or success message */}
        {isSent ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-neon/30 bg-neon/10 p-5 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-neon text-obsidian">
                <Check className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-foreground">Email Sent Successfully</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Please check <span className="text-foreground font-medium">{email}</span> for instructions to complete your password reset.
              </p>
            </div>
            
            <button
              onClick={() => router.push('/auth/login')}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-neon text-sm font-bold tracking-wide text-obsidian transition-all hover:bg-neon-bright cursor-pointer"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="h-12 w-full rounded-xl border border-border bg-obsidian-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
                  required
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-center text-xs text-destructive">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'flex h-12 w-full items-center justify-center rounded-xl bg-neon text-sm font-bold tracking-wide text-obsidian transition-all hover:bg-neon-bright disabled:opacity-50 cursor-pointer',
                isLoading && 'cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-obsidian border-t-transparent" />
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
