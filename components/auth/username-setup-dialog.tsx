'use client'

import { useState } from 'react'
import { User } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db, handleFirestoreError, OperationType } from '@/lib/firebase'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function UsernameSetupDialog({ user, onComplete }: { user: User, onComplete: () => void }) {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return
    
    setIsLoading(true)
    const newProfileData = {
      id: user.uid,
      username: username.trim(),
      displayName: user.displayName || username.trim(),
      bio: 'Pixel adventurer & Kraftedit creator.',
      avatarUrl: `https://mc-heads.net/avatar/${username.trim()}/128`,
      publicProfile: true,
      skinsCreated: 0,
      totalDownloads: 0,
      followers: 0,
      following: 0,
      createdAt: serverTimestamp(),
    }
    
    try {
      await setDoc(doc(db, 'users', user.uid), newProfileData)
      onComplete()
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Setup Username</DialogTitle>
          <DialogDescription>
            Choose a unique username to complete your profile setup.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., steve_craft"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Setting up...' : 'Complete Profile'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
