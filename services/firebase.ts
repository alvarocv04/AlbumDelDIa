
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBArkwDsmLD8RE7olK5wk7WkNIsgVxSDPo",
    authDomain: "albumaldia-1.firebaseapp.com",
    projectId: "albumaldia-1",
    storageBucket: "albumaldia-1.firebasestorage.app",
    messagingSenderId: "984458188806",
    appId: "1:984458188806:web:c4cd44d0d10799d24b0b87",
    measurementId: "G-PLR2813MBQ"
};


import { getAuth, GoogleAuthProvider } from "firebase/auth";
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
