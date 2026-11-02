import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCb0nldwpe3JhnwWQL_j59bpu_VXE1Al5k",
  authDomain: "purohitsetu-8993b.firebaseapp.com",
  projectId: "purohitsetu-8993b",
  storageBucket: "purohitsetu-8993b.firebasestorage.app",
  messagingSenderId: "235106814283",
  appId: "1:235106814283:web:3e2535f024e7d6e9c600ce",
  measurementId: "G-ZD3P472RY4"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };