import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCbEnLdwpc3JhnwMQL_j59bpu_VXE1A15K",
  authDomain: "purohitsetu-8993b.firebaseapp.com",
  projectId: "purohitsetu-8993b",
  storageBucket: "purohitsetu-8993b.firebasestorage.app",
  messagingSenderId: "235106814283",
  appId: "1:235106814283:web:3e2535f024e7d6e9c600ce",
  measurementId: "G-ZQ3P472RY4"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);