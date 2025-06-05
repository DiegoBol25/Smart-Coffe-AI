// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, child } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyDOH9uCe-ZUiNzKn38JVX6yxqcp4qYOWQs",
    authDomain: "labiv-78907.firebaseapp.com",
    databaseURL: "https://labiv-78907-default-rtdb.firebaseio.com",
    projectId: "labiv-78907",
    storageBucket: "labiv-78907.firebasestorage.app",
    messagingSenderId: "562166365177",
    appId: "1:562166365177:web:3125fad6cefd24719c5b28",
    measurementId: "G-XNJNQK5GX8"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, get, child };
