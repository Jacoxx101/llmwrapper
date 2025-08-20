'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth'
import { auth, isFirebaseConfigured, initializeFirebaseClient } from '@/lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }

    // Initialize Firebase client-side
    const { auth: firebaseAuth } = initializeFirebaseClient()
    
    if (!firebaseAuth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials.')
    }
    const { auth: firebaseAuth } = initializeFirebaseClient()
    if (!firebaseAuth) {
      throw new Error('Firebase Auth is not available.')
    }
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password)
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials.')
    }
    const { auth: firebaseAuth } = initializeFirebaseClient()
    if (!firebaseAuth) {
      throw new Error('Firebase Auth is not available.')
    }
    try {
      const result = await createUserWithEmailAndPassword(firebaseAuth, email, password)
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName })
      }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials.')
    }
    const { auth: firebaseAuth } = initializeFirebaseClient()
    if (!firebaseAuth) {
      throw new Error('Firebase Auth is not available.')
    }
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(firebaseAuth, provider)
    } catch (error) {
      console.error('Google sign in error:', error)
      throw error
    }
  }

  const logout = async () => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials.')
    }
    const { auth: firebaseAuth } = initializeFirebaseClient()
    if (!firebaseAuth) {
      throw new Error('Firebase Auth is not available.')
    }
    try {
      await signOut(firebaseAuth)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}