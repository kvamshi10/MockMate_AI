/**
 * ==========================================
 * FIREBASE CLIENT INITIALIZATION
 * ==========================================
 * This file configures the Firebase frontend/client SDK.
 * This is used inside the browser for authenticating users via popups, magic links, 
 * and reading public/protected data directly from the client.
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if it hasn't been initialized already to prevent crashing in dev mode
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize the Auth interface (used heavily in AuthForm)
const auth = getAuth(app);

// Initialize the Firestore DB natively to access public/client documents
const db = getFirestore(app);

// Initialize Firebase Storage
const storage = getStorage(app);

/**
 * Initialize Analytics conditionally to avoid Next.js Server-Side errors.
 * Analytics relies on the browser's `window` object, so wrapping it in a `typeof window !== "undefined"`
 * ensures it never tries to run on the server during the build process!
 */
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, analytics, auth, db, storage };
