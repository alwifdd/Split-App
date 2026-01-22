// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config (punya kamu)
const firebaseConfig = {
  apiKey: "AIzaSyBz490pryq-wM-JjuzYv0a9l1GS24n_R3k",
  authDomain: "splitbillapp-c8b21.firebaseapp.com",
  projectId: "splitbillapp-c8b21",
  storageBucket: "splitbillapp-c8b21.firebasestorage.app",
  messagingSenderId: "203022210073",
  appId: "1:203022210073:web:b953d66b5163fbc988c688",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
