import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDJDqeSFJsqpj0JRVbMYehv7cmWDhVdgms",
  authDomain: "pashubazaar-f725d.firebaseapp.com",
  projectId: "pashubazaar-f725d",
  storageBucket: "pashubazaar-f725d.firebasestorage.app",
  messagingSenderId: "1099127658434",
  appId: "1:1099127658434:web:99870dea6fa2226fec685b",
  measurementId: "G-KK33TTLVLN"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
