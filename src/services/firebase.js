import { initializeApp } from "firebase/app";
import { 
  initializeAuth, 
  getReactNativePersistence, 
  getAuth, 
  GoogleAuthProvider, 
  browserLocalPersistence, 
  setPersistence 
} from "firebase/auth";
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKb38fuQkuE5BOqQ0zpcLycD3jBmyTDO4",
  authDomain: "task-6e1b4.firebaseapp.com",
  projectId: "task-6e1b4",
  storageBucket: "task-6e1b4.firebasestorage.app",
  messagingSenderId: "1003844937796",
  appId: "1:1003844937796:web:c400fec103d38d1601f411",
  measurementId: "G-WTH2V7VXDM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence based on Platform
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
  // Explicitly set persistence for web
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Auth Persistence Error:", error);
  });
} else {
  // Use React Native persistence for mobile apps
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence ? getReactNativePersistence(ReactNativeAsyncStorage) : undefined
  });
}

// Initialize Firestore with settings
let db;
if (Platform.OS === 'web') {
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    });
  } catch (e) {
    console.warn("Firestore initialization error (ignoring if dubplicate):", e);
    db = getFirestore(app);
  }
} else {
  // For native, use default configuration which uses AsyncStorage automatically
  // Do NOT explicitly set localCache: persistentLocalCache() as that defaults to IndexedDB
  db = getFirestore(app);
}

export { app, auth, db, GoogleAuthProvider };