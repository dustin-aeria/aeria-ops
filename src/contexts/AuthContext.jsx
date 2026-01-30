/**
 * AuthContext.jsx
 * Authentication context provider for Firebase Auth
 * 
 * Batch 3 Fix:
 * - Added resetPassword function for password reset flow (M-10)
 * 
 * @location src/contexts/AuthContext.jsx
 * @action REPLACE
 */

import { createContext, useContext, useEffect, useState } from 'react'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

const AuthContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    let currentUserId = null

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clear error on auth state change
      setError(null)

      if (firebaseUser) {
        // Track current user to prevent race conditions
        currentUserId = firebaseUser.uid
        setUser(firebaseUser)

        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'operators', firebaseUser.uid))

          // Check if this is still the current user (prevent race condition)
          if (!isMounted || currentUserId !== firebaseUser.uid) return

          if (userDoc.exists()) {
            setUserProfile({ id: userDoc.id, ...userDoc.data() })
          } else {
            // User exists in Auth but not in Firestore yet
            setUserProfile({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              firstName: '',
              lastName: '',
            })
          }
        } catch (err) {
          // Check if component is still mounted and user hasn't changed
          if (!isMounted || currentUserId !== firebaseUser.uid) return
          // User profile fetch failed - basic auth info still available
          setError(err.message || 'Failed to load user profile')
        }
      } else {
        currentUserId = null
        setUser(null)
        setUserProfile(null)
      }

      if (isMounted) {
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  const signIn = async (email, password) => {
    setError(null)
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return result.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const signOut = async () => {
    setError(null)
    try {
      await firebaseSignOut(auth)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  /**
   * Send password reset email
   * @param {string} email - User's email address
   * @returns {Promise<void>}
   * @throws {Error} Firebase auth errors
   */
  const resetPassword = async (email) => {
    setError(null)
    try {
      await sendPasswordResetEmail(auth, email, {
        // Optional: customize the action URL
        // url: window.location.origin + '/login',
      })
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    error,
    signIn,
    signOut,
    resetPassword,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
