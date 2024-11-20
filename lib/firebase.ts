// lib/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // For Firebase Authentication
import { getFirestore } from "firebase/firestore"; // For Firestore Database (if used)
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBdKtDmzEpNojVOFwhUlyLnzA77hnAMU7A",
  authDomain: "blog-b2adb.firebaseapp.com",
  projectId: "blog-b2adb",
  storageBucket: "blog-b2adb.firebasestorage.app",
  messagingSenderId: "25732568102",
  appId: "1:25732568102:web:2b4be0a3b1fe7c284382e7",
  measurementId: "G-KNTDNVF7W8"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services (Auth and Firestore)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Correctly initialize storage
