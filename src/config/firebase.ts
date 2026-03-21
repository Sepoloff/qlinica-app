import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ⚠️ SUBSTITUIR COM TEUS VALORES DO FIREBASE CONSOLE
// https://console.firebase.google.com/

const firebaseConfig = {
  apiKey: "AIzaSy_EXAMPLE_REPLACE_ME",
  authDomain: "qlinica-app.firebaseapp.com",
  projectId: "qlinica-app",
  storageBucket: "qlinica-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Initialize Cloud Storage
export const storage = getStorage(app);

export default app;
