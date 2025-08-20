import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics'

// Check if Firebase environment variables are configured
export const isFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
)

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let analytics: Analytics | null = null

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase only if properly configured and not already initialized
if (isFirebaseConfigured && typeof window !== 'undefined') {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
    
    // Initialize Firebase Authentication and Firestore
    if (app) {
      auth = getAuth(app)
      db = getFirestore(app)
      
      // Initialize Analytics (only in browser environment)
      isSupported().then((supported) => {
        if (supported && app) {
          analytics = getAnalytics(app)
        }
      }).catch(console.warn)
    }
  } catch (error) {
    console.error('Firebase initialization error:', error)
  }
}

// Initialize Firebase for client-side usage
export function initializeFirebaseClient() {
  if (typeof window !== 'undefined' && isFirebaseConfigured && !app) {
    try {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
      
      if (app) {
        auth = getAuth(app)
        db = getFirestore(app)
        
        isSupported().then((supported) => {
          if (supported && app) {
            analytics = getAnalytics(app)
          }
        }).catch(console.warn)
      }
    } catch (error) {
      console.error('Firebase client initialization error:', error)
    }
  }
  return { app, auth, db, analytics }
}

export { auth, db, analytics }
export default app