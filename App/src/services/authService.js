// src/services/authService.js (Cod COMPLET Modificat)

import { auth, db } from './firebase'; 
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
// 🛑 MODIFICARE: Importă lista de avatare
import { AVAILABLE_AVATARS } from '../utils/avatarPaths'; 

// 🛑 NOU: Funcție ajutătoare pentru a alege aleatoriu un avatar
const getRandomAvatar = () => {
    const index = Math.floor(Math.random() * AVAILABLE_AVATARS.length);
    return AVAILABLE_AVATARS[index];
};


/**
 * Inregistreaza un utilizator nou cu email si parola si ii salveaza profilul in Firestore.
 */
export const registerUser = async (email, password, username) => {
  // 1. Creeaza user-ul in Firebase Authentication
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // 🛑 MODIFICARE: Alege un avatar aleatoriu
  const initialAvatarUrl = getRandomAvatar(); 

  // 2. Adauga detalii suplimentare in Firestore
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    username: username,
    email: email,
    bio: "Salut! Sunt nou pe platforma.",
    followers: [],
    following: [],
    createdAt: new Date(),
    // 🛑 MODIFICARE: Salvează calea locală aleatorie
    profilePicture: initialAvatarUrl 
  });

  return user;
};

/**
 * Autentifica un utilizator existent.
 */
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Deautentifica utilizatorul curent.
 */
export const logoutUser = () => {
  return signOut(auth);
};