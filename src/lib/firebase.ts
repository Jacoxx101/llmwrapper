import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgZVm5wvAYSwc3RWhyBJ1KjYqhdmM2paw",
  authDomain: "opendoor-654d1.firebaseapp.com",
  projectId: "opendoor-654d1",
  storageBucket: "opendoor-654d1.firebasestorage.app",
  messagingSenderId: "23158182272",
  appId: "1:23158182272:web:478b8ced934048cc5af165",
  measurementId: "G-98QK1SMGWX"
}

// Firebase is now always configured
export const isFirebaseConfigured = true

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let analytics: Analytics | null = null

// Initialize Firebase for client-side usage
export function initializeFirebaseClient() {
  if (typeof window !== 'undefined' && !app) {
    try {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
      
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
      console.error('Firebase client initialization error:', error)
    }
  }
  return { app, auth, db, analytics }
}

// Initialize Firebase immediately for client-side
if (typeof window !== 'undefined') {
  initializeFirebaseClient()
}

export { auth, db, analytics }
export default app