// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "plant-3938f.firebaseapp.com",
  projectId: "plant-3938f",
  storageBucket: "plant-3938f.firebasestorage.app",
  messagingSenderId: "225598667008",
  appId: "1:225598667008:web:6a7d6630ff551094bd1be5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
