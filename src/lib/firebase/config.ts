
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
// import { getStorage, connectStorageEmulator } from 'firebase/storage'; // If you use Firebase Storage

// IMPORTANT: Replace these with your actual Firebase project configuration values!
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-auth-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-storage-bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "your-messaging-sender-id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "your-app-id",
};

let app: FirebaseApp;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);
// const storage = getStorage(app); // If you use Firebase Storage

console.log('[Firebase Config] Initializing...');
console.log(`[Firebase Config] NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`[Firebase Config] NEXT_PUBLIC_USE_EMULATORS: ${process.env.NEXT_PUBLIC_USE_EMULATORS}`);

const useEmulators = process.env.NEXT_PUBLIC_USE_EMULATORS === 'true';

if (useEmulators && (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')) {
  try {
    console.log("[Firebase Config] Connecting to Firebase Emulators...");
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    // connectStorageEmulator(storage, 'localhost', 9199); // If you use Firebase Storage
    console.log("[Firebase Config] Successfully connected to Firebase Emulators: Auth (9099), Firestore (8080)");
  } catch (error) {
    console.error("[Firebase Config] Error connecting to Firebase Emulators: ", error);
    console.log("[Firebase Config] Ensure Firebase Emulators are running. Run 'firebase emulators:start'");
  }
} else {
    console.log("[Firebase Config] Connecting to LIVE Firebase project.");
    if (!useEmulators) {
        console.log("[Firebase Config] Reason: NEXT_PUBLIC_USE_EMULATORS is not 'true'.");
    }
    if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
        console.log(`[Firebase Config] Reason: NODE_ENV is '${process.env.NODE_ENV}', not 'development' or 'test'.`);
    }
}

export { app, auth, db /*, storage */ };
