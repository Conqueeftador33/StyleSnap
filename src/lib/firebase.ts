
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// IMPORTANT: Replace with your actual Firebase config values
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// --- DIAGNOSTIC LOGGING START ---
console.log("Firebase Config Being Used by the App:");
console.log("API Key:", firebaseConfig.apiKey ? "Loaded" : "MISSING or UNDEFINED");
if (firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith("YOUR_")) {
  console.warn("WARNING: API Key looks like a placeholder. Ensure it's replaced with your actual Firebase API Key.");
}
console.log("Auth Domain:", firebaseConfig.authDomain);
console.log("Project ID:", firebaseConfig.projectId);
// You can add more logs here if needed for other config values
// --- DIAGNOSTIC LOGGING END ---

// Initialize Firebase
let app;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    console.log("Firebase App initialized successfully.");
  } catch (error) {
    console.error("Firebase initialization error:", error);
    // Potentially re-throw or handle more gracefully if critical for app startup
    // For now, we'll let it proceed to getAuth/getFirestore which will likely also fail
    // if initialization itself failed due to bad config.
  }
} else {
  app = getApp();
  console.log("Existing Firebase App instance retrieved.");
}

let auth, db;

try {
  auth = getAuth(app);
} catch (error) {
  console.error("Error getting Firebase Auth instance:", error);
  // This can happen if app initialization failed or was partial
}

try {
  db = getFirestore(app);
} catch (error) {
  console.error("Error getting Firestore instance:", error);
   // This can happen if app initialization failed or was partial
}


export { app, auth, db };
