
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// IMPORTANT: These values MUST come from your Firebase project settings.
// For local development, set them in a .env.local file in your project root.
// Example .env.local content:
// NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_ACTUAL_API_KEY"
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_PROJECT.firebaseapp.com"
// NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
// ... and so on for other variables.

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// --- DIAGNOSTIC LOGGING & PRE-INITIALIZATION CHECK ---
console.log("Attempting to initialize Firebase with the following configuration:");
console.log("API Key Loaded:", firebaseConfig.apiKey ? `"${firebaseConfig.apiKey}"` : "MISSING or UNDEFINED");
console.log("Auth Domain Loaded:", firebaseConfig.authDomain || "MISSING or UNDEFINED");
console.log("Project ID Loaded:", firebaseConfig.projectId || "MISSING or UNDEFINED");

let app;
let auth;
let db;

if (!firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith("YOUR_") || firebaseConfig.apiKey === "YOUR_ACTUAL_API_KEY") {
  console.error(
    "******************************************************************************************\n" +
    "CRITICAL FIREBASE CONFIGURATION ERROR:\n" +
    "Firebase API Key is MISSING or is still a PLACEHOLDER.\n" +
    "To run this app locally and connect to your Firebase project, you MUST:\n" +
    "1. Create a file named '.env.local' in the ROOT of your project directory.\n" +
    "2. Add your ACTUAL Firebase project credentials to this '.env.local' file.\n\n" +
    "   Example '.env.local' content (replace placeholders with YOUR values):\n" +
    "   NEXT_PUBLIC_FIREBASE_API_KEY=\"YOUR_REAL_API_KEY_FROM_FIREBASE_CONSOLE\"\n" +
    "   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=\"your-project-id.firebaseapp.com\"\n" +
    "   NEXT_PUBLIC_FIREBASE_PROJECT_ID=\"your-project-id\"\n" +
    "   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=\"your-project-id.appspot.com\"\n" +
    "   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=\"your-sender-id\"\n" +
    "   NEXT_PUBLIC_FIREBASE_APP_ID=\"your-app-id\"\n\n" +
    "3. After creating or updating the '.env.local' file, YOU MUST RESTART\n" +
    "   your Next.js development server (e.g., stop and re-run 'npm run dev').\n\n" +
    "Firebase services (Authentication, Firestore) will NOT be initialized until this is corrected.\n" +
    "You can find your Firebase project credentials in your Firebase project settings on the Firebase Console.\n" +
    "******************************************************************************************"
  );
  // Firebase services (auth, db) will remain undefined, preventing further Firebase errors.
} else {
  // Initialize Firebase
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      console.log("Firebase App initialized successfully.");
    } catch (error) {
      console.error("Firebase initialization error during initializeApp:", error);
      app = undefined; // Ensure app is undefined if initialization fails
    }
  } else {
    app = getApp();
    console.log("Existing Firebase App instance retrieved.");
  }

  if (app) {
    try {
      auth = getAuth(app);
    } catch (error) {
      console.error("Error getting Firebase Auth instance:", error);
      auth = undefined;
    }

    try {
      db = getFirestore(app);
    } catch (error) {
      console.error("Error getting Firestore instance:", error);
      db = undefined;
    }
  } else {
    console.warn("Firebase app was not initialized (likely due to config issues or previous error). Auth and Firestore services will not be available.");
  }
}

export { app, auth, db };
