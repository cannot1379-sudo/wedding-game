import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "mock",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "mock"
};

const apps = getApps();
export const app = !apps.length ? initializeApp(firebaseConfig) : apps[0];
export const db = getFirestore(app);
export const auth = getAuth(app);
