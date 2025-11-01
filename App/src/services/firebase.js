// App/src/services/firebase.js

// Importă funcția de inițializare a aplicației (existentă)
import { initializeApp } from "firebase/app";

// Importă serviciile specifice de care ai nevoie:
import { getAuth } from "firebase/auth";       // Pentru autentificare (login, register)
import { getFirestore } from "firebase/firestore"; // Pentru baza de date (postări, useri)
import { getStorage } from "firebase/storage";   // Pentru imagini și video-uri (Storage)
// import { getAnalytics } from "firebase/analytics"; // Analytics e optional in development

// Configuratia ta existenta:
const firebaseConfig = {
  apiKey: "AIzaSyBG-ReVbPA6ZWA52PRlOZKt-uJUo5spcBs",
  authDomain: "hackathon-19efa.firebaseapp.com",
  projectId: "hackathon-19efa",
  storageBucket: "hackathon-19efa.appspot.com",
  messagingSenderId: "21600496175",
  appId: "1:21600496175:web:b2e6929701114b5b0634da",
  measurementId: "G-Z359L1PTC4"
};

// Inițializarea aplicației (existentă)
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // Poți comenta asta în timpul dezvoltării

// ----------------------------------------------------
// NOU: Inițializarea și Exportul Serviciilor
// ----------------------------------------------------

// 1. Inițializează și exportă serviciul de Autentificare
export const auth = getAuth(app);

// 2. Inițializează și exportă serviciul de Bază de Date Firestore
export const db = getFirestore(app);

// 3. Inițializează și exportă serviciul de Stocare (pentru imagini/video)
export const storage = getStorage(app);

// Păstrezi exportul pentru o eventuală refolosire a instanței de bază:
export default app;