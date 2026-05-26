'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { doc, getDoc, getDocFromServer, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, handleFirestoreError, OperationType } from '@/lib/firebase'
import type { UserProfile } from '@/types/skin'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  isInitialized: boolean
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  isInitialized: false,
  refreshUserProfile: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isInitialized, setIsInitialized] = useState<boolean>(false)

  // 1. Validate connection to Firestore on initial boot
  useEffect(() => {
    async function testConnection() {
      const connPath = 'test/connection'
      try {
        await getDocFromServer(doc(db, 'test', 'connection'))
        console.log('Successfully connected to Firestore on boot.')
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration: Client is offline.")
        } else {
          // Suppress or log other transient connection test warnings
          console.warn('Boot Firestore connection test resolved:', error)
        }
      }
    }
    testConnection()
  }, [])

  // Helper to fetch user profile
  const fetchProfile = async (uid: string): Promise<UserProfile | null> => {
    const userPath = `users/${uid}`
    try {
      const docRef = doc(db, 'users', uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: data.id,
          username: data.username,
          displayName: data.displayName || '',
          bio: data.bio || '',
          avatarUrl: data.avatarUrl || `https://mc-heads.net/avatar/${data.username || 'Steve'}/128`,
          publicProfile: data.publicProfile ?? true,
          skinsCreated: data.skinsCreated || 0,
          totalDownloads: data.totalDownloads || 0,
          followers: data.followers || 0,
          following: data.following || 0,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
        } as UserProfile
      }
      return null
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, userPath)
    }
  }

  const refreshUserProfile = async () => {
    if (!user) return
    const profile = await fetchProfile(user.uid)
    if (profile) {
      setUserProfile(profile)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        const profile = await fetchProfile(currentUser.uid)
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
      setIsInitialized(true)
    })

    return () => unsubscribe()
  }, [user?.uid])

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, isInitialized, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
