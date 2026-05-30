// Firebase Configuration
// Replace these values with your actual Firebase project config
// Get these values from: Firebase Console > Project Settings > Your apps

const firebaseConfig = {
  // Get your API key from Firebase Console
  apiKey: "AIzaSyAYxx",

  // Your Firebase auth domain
  authDomain: "urologie-9b2bf.firebaseapp.com",

  // Your Firebase project ID
  projectId: "urologie-9b2bf",

  // Your Firebase storage bucket
  storageBucket: "urologie-9b2bf.appspot.com",

  // Your Firebase messaging sender ID
  messagingSenderId: "123456789",

  // Your Firebase app ID
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  if (error.code === 'app/duplicate-app') {
    console.log('Firebase already initialized');
  } else {
    console.error('Firebase initialization error:', error);
  }
}
