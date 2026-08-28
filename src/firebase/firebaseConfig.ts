import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// REPLACE WITH YOUR ACTUAL FIREBASE CONFIGURATION PLACEHOLDERS
const firebaseConfig = {
  apiKey: "AIzaSyA9BSVAN0IIrqam4TtQp56n04_XO92Ct2A",
  authDomain: "tynex-top-up.firebaseapp.com",
  projectId: "tynex-top-up",
  storageBucket: "tynex-top-up.firebasestorage.app",
  messagingSenderId: "86870567713",
  appId: "1:86870567713:web:67f32cd876026165a4ec60"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);