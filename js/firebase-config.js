// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBEpABQyCdqL0Rf2uR2BG0EdptBODJSkKQ",
  authDomain: "urologie-9b2bf.firebaseapp.com",
  projectId: "urologie-9b2bf",
  storageBucket: "urologie-9b2bf.firebasestorage.app",
  messagingSenderId: "1077592926712",
  appId: "1:1077592926712:web:31a5ae25c2e33942518e0d",
  measurementId: "G-3P17G2KE8C"
};

// Initialize Firebase
try {
  // For Firebase 9+ modular SDK
  if (typeof firebase !== 'undefined' && firebase.initializeApp) {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
      console.log('Firebase initialized successfully');
    }
  } else {
    console.warn('Firebase SDK not available');
  }
} catch (error) {
  if (error.code === 'app/duplicate-app') {
    console.log('Firebase already initialized');
  } else {
    console.error('Firebase initialization error:', error);
  }
}
