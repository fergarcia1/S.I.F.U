import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBdC8rf4fyti2AqjnZzh3GRe_yDmsyW2AY",
  authDomain: "sifu-app-abb54.firebaseapp.com",
  projectId: "sifu-app-abb54",
  storageBucket: "sifu-app-abb54.firebasestorage.app",
  messagingSenderId: "1025588072826",
  appId: "1:1025588072826:web:adc3eb571c650c7353c6c3"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);