// Archivo: /public/js/firebase.js

// Importación e inicialización de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyADZNrWQeEqmWMm8M0gUVyTXtIUHtf78uE",
  authDomain: "rhvipz.firebaseapp.com",
  projectId: "rhvipz",
  storageBucket: "rhvipz.appspot.com",
  messagingSenderId: "1010823002418",
  appId: "1:1010823002418:web:3261c7ce89707a6acf3f2b"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
