import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

function initFirebaseClient() {
  if (getApps().length > 0) return getApps()[0];

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "";
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "";
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "";
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "";

  // Do not throw during build — initialization will fail at runtime in the browser if vars are missing.
  const app = initializeApp({
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  });

  return app;
}

export function getClientDb() {
  const app = initFirebaseClient();
  return getFirestore(app as any);
}
