// src/services/authService.js (Cod COMPLET Modificat)

import { auth, db } from './firebase'; 
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail // 🛑 NOU: Adăugat
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { AVAILABLE_AVATARS } from '../utils/avatarPaths'; 

const getRandomAvatar = () => {
    const index = Math.floor(Math.random() * AVAILABLE_AVATARS.length);
    return AVAILABLE_AVATARS[index];
};


/**
 * Inregistreaza un utilizator nou cu email si parola si ii salveaza profilul in Firestore.
 */
export const registerUser = async (email, password, username) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const initialAvatarUrl = getRandomAvatar(); 

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    username: username,
    email: email,
    bio: "Salut! Sunt nou pe platforma.",
    followers: [],
    following: [],
    createdAt: new Date(),
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

// 🛑 NOU: Functie de resetare a parolei
export const sendPasswordReset = async (email) => {
    await sendPasswordResetEmail(auth, email);
};