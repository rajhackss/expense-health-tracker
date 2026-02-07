import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDJPLnNdHjSMKOX1QR9SOixewE4fRg4Fus",
    authDomain: "lifesync-24ed7.firebaseapp.com",
    projectId: "lifesync-24ed7",
    storageBucket: "lifesync-24ed7.firebasestorage.app",
    messagingSenderId: "1084892383973",
    appId: "1:1084892383973:web:face8dee9dfc512e6be20c"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
