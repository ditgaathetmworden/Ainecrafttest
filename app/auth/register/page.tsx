'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, Sparkles, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp, getDocs, query, collection, where } from 'firebase/firestore'
import { auth, db, handleFirestoreError, OperationType } from '@/lib/firebase'

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

  // Password strength indicators
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  }
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const formattedUsername = username.toUpperCase().trim()
    if (formattedUsername.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!acceptTerms) {
      setError('Please accept the terms and conditions')
      return
    }

    if (passwordStrength < 3) {
      setError('Please use a stronger password')
      return
    }

    setIsLoading(true)

    try {
      // 1. Check if username is already taken
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('username', '==', formattedUsername))
      const querySnap = await getDocs(q)
      
      if (!querySnap.empty) {
        setError('Username is already taken')
        setIsLoading(false)
        return
      }

      // 2. Register user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // 3. Update auth display profile
      await updateProfile(user, {
        displayName: username.trim(),
      })

      // 4. Create companion UserProfile document in Firestore
      const userPath = `users/${user.uid}`
      try {
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          username: formattedUsername,
          displayName: username.trim(),
          bio: 'Pixel adventurer & Kraftedit creator.',
          avatarUrl: `https://mc-heads.net/avatar/${formattedUsername}/128`,
          publicProfile: true,
          skinsCreated: 0,
          totalDownloads: 0,
          followers: 0,
          following: 0,
          createdAt: serverTimestamp(),
        })
      } catch (dbErr) {
        // Handle database creation error
        handleFirestoreError(dbErr, OperationType.CREATE, userPath)
      }

      router.push('/')
    } catch (authErr: any) {
      console.error('Registration failed:', authErr)
      if (authErr.code === 'auth/email-already-in-use') {
        setError('This email is already registered')
      } else if (authErr.code === 'auth/invalid-email') {
        setError('Invalid email address format')
      } else if (authErr.code === 'auth/weak-password') {
        setError('The password is too weak')
      } else {
        setError(authErr.message || 'An error occurred during registration')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {/* Header */}
      <header className="shrink-0 px-6 pt-8 pb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neon/10">
          <Sparkles className="h-8 w-8 text-neon" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Create account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Start creating amazing skins</p>
      </header>

      {/* Form */}
      <main className="flex-1 overflow-auto px-6">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          {/* Username */}
          <div className="space-y-2">
            <label htmlFor="username" className="text-xs font-medium text-muted-foreground">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                placeholder="YOUR_USERNAME"
                maxLength={16}
                className="h-12 w-full rounded-xl border border-border bg-obsidian-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
                required
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Letters, numbers, and underscores only</p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
              Email
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

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="h-12 w-full rounded-xl border border-border bg-obsidian-card pl-10 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {/* Password Strength */}
            {password && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={cn(
                        'h-1 flex-1 rounded-full transition-colors',
                        passwordStrength >= level
                          ? passwordStrength <= 2
                            ? 'bg-destructive'
                            : passwordStrength === 3
                            ? 'bg-yellow-500'
                            : 'bg-neon'
                          : 'bg-obsidian-elevated'
                      )}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <div className={cn('flex items-center gap-1', passwordChecks.length ? 'text-neon' : 'text-muted-foreground')}>
                    <Check className="h-3 w-3" /> 8+ characters
                  </div>
                  <div className={cn('flex items-center gap-1', passwordChecks.uppercase ? 'text-neon' : 'text-muted-foreground')}>
                    <Check className="h-3 w-3" /> Uppercase
                  </div>
                  <div className={cn('flex items-center gap-1', passwordChecks.lowercase ? 'text-neon' : 'text-muted-foreground')}>
                    <Check className="h-3 w-3" /> Lowercase
                  </div>
                  <div className={cn('flex items-center gap-1', passwordChecks.number ? 'text-neon' : 'text-muted-foreground')}>
                    <Check className="h-3 w-3" /> Number
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-xs font-medium text-muted-foreground">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className={cn(
                  'h-12 w-full rounded-xl border bg-obsidian-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1',
                  confirmPassword && password !== confirmPassword
                    ? 'border-destructive focus:border-destructive focus:ring-destructive'
                    : 'border-border focus:border-neon focus:ring-neon'
                )}
                required
              />
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3 py-2">
            <button
              type="button"
              onClick={() => setAcceptTerms(!acceptTerms)}
              className={cn(
                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
                acceptTerms
                  ? 'border-neon bg-neon text-obsidian'
                  : 'border-border bg-obsidian-card'
              )}
            >
              {acceptTerms && <Check className="h-3 w-3" />}
            </button>
            <p className="text-xs text-muted-foreground">
              I agree to the{' '}
              <Link href="/terms" className="text-neon hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-neon hover:underline">
                Privacy Policy
              </Link>
            </p>
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
              'Create Account'
            )}
          </button>
        </form>
      </main>

      {/* Footer */}
      <footer className="shrink-0 px-6 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-neon hover:underline">
            Sign in
          </Link>
        </p>
      </footer>
    </div>
  )
}
