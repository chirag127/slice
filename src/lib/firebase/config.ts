import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBQBi7dSFPDnuUNjdRGrSA7pEd_qYz6MT0",
  authDomain: "slice-oriz.firebaseapp.com",
  projectId: "slice-oriz",
  storageBucket: "slice-oriz.firebasestorage.app",
  messagingSenderId: "645232672185",
  appId: "1:645232672185:web:9a0ccbbe4ae607a8388a68",
  measurementId: "G-6N6F2BSZ85"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics conditionally to avoid errors in environments where it might not be supported (like SSR if added later)
export let analytics: any;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export default app;
