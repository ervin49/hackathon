// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBG-ReVbPA6ZWA52PRlOZKt-uJUo5spcBs",
  authDomain: "hackathon-19efa.firebaseapp.com",
  projectId: "hackathon-19efa",
  storageBucket: "hackathon-19efa.firebasestorage.app",
  messagingSenderId: "21600496175",
  appId: "1:21600496175:web:b2e6929701114b5b0634da",
  measurementId: "G-Z359L1PTC4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);