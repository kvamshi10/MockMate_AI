/**
 * ==========================================
 * FIREBASE ADMIN INITIALIZATION
 * ==========================================
 * This file configures the Firebase Admin SDK. Unlike the client SDK (`firebase/client.ts`), 
 * the Admin SDK has completely unrestricted access to your Firebase project. 
 * 
 * IMPORTANT: This file should ONLY ever be imported inside Server Components, 
 * Server Actions (`'use server'`), or API Routes. Never expose this to the browser!
 */
// Fix Firestore DNS name resolution errors by preferring REST and native resolver:
process.env.FIRESTORE_PREFER_REST = "true";
process.env.GRPC_DNS_RESOLVER = "native";

import * as admin from 'firebase-admin';

// We check if an app instance already exists to prevent Next.js hot-reloading 
// from crashing the server by trying to initialize Firebase multiple times.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // The private key comes with escaped newline characters, so we must replace /\\n/ with actual newlines \n
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// Export the powerful admin instances
const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { adminDb, adminAuth };
