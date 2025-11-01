import { auth, db } from './firebase'; 
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

/**
 * Inregistreaza un utilizator nou cu email si parola si ii salveaza profilul in Firestore.
 * @param {string} email - Email-ul utilizatorului.
 * @param {string} password - Parola utilizatorului.
 * @param {string} username - Numele de utilizator.
 * @returns {Promise<Object>} Obiectul utilizatorului Firebase.
 */
export const registerUser = async (email, password, username) => {
  // 1. Creeaza user-ul in Firebase Authentication
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // 2. Adauga detalii suplimentare in Firestore
  // Folosim UID-ul userului ca ID al documentului in colectia 'users'
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    username: username,
    email: email,
    bio: "Salut! Sunt nou pe platforma.", // Bio default
    followers: [],
    following: [],
    createdAt: new Date(),
    profilePicture: '/assets/default-profile.png' // Presupune ca ai o imagine default in public/assets
  });

  return user;
};

/**
 * Autentifica un utilizator existent.
 * @param {string} email - Email-ul utilizatorului.
 * @param {string} password - Parola utilizatorului.
 * @returns {Promise<Object>} Obiectul utilizatorului Firebase.
 */
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Deautentifica utilizatorul curent.
 * @returns {Promise<void>}
 */
export const logoutUser = () => {
  return signOut(auth);
};