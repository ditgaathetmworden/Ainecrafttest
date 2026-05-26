'use client'

import { useState } from 'react'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/components/providers/firebase-auth-provider'

export function GoogleSignInButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  if (user) {
    return <div className="text-xs text-muted-foreground">Signed in as {user.displayName}</div>
  }

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error('Sign in failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className="rounded-full bg-foreground px-4 py-1.5 text-xs font-bold text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
    >
      {isLoading ? 'Signing in...' : 'Sign in with Google'}
    </button>
  )
}
