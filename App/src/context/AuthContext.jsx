import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../services/firebase'; 
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from 'firebase/firestore'; 
import * as authService from '../services/authService';

// Creeaza Contextul
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Starea pentru obiectul utilizatorului Firebase (uid, email)
  const [currentUser, setCurrentUser] = useState(null); 
  // Starea pentru datele suplimentare din Firestore (username, bio)
  const [userData, setUserData] = useState(null); 
  // Starea care indică dacă se așteaptă răspunsul inițial de la Firebase
  const [loading, setLoading] = useState(true);

  // Funcție pentru a prelua datele utilizatorului din Firestore (username, bio)
  const fetchUserData = async (uid) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        console.warn("Datele utilizatorului nu au fost găsite în Firestore.");
        setUserData(null);
      }
    } catch (error) {
      console.error("Eroare la preluarea datelor userului din Firestore:", error);
    }
  };

  // Efectul: Ascultă schimbările de stare de autentificare de la Firebase
  useEffect(() => {
    // onAuthStateChanged returnează o funcție de dezabonare (unsubscribe)
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      
      if (user) {
        // Dacă utilizatorul este logat, preia și datele suplimentare
        fetchUserData(user.uid);
      } else {
        // Dacă utilizatorul este delogat, șterge datele din state
        setUserData(null);
      }
      
      // Setează loading pe fals o singură dată, după ce s-a verificat starea inițială
      setLoading(false);
    });

    // Curăță ascultătorul când componenta este demontată (React cleanup)
    return unsubscribe; 
  }, []); // Se rulează doar la montarea componentei

  // Obiectul cu valorile pe care le furnizăm contextului (accesibile prin useAuth)
  const value = {
    currentUser,          // Obiectul utilizatorului Firebase (uid, email)
    userData,             // Datele din Firestore (username, bio, etc.)
    loading,              // Starea de încărcare inițială
    login: authService.loginUser,
    register: authService.registerUser,
    logout: authService.logoutUser
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Randează copiii doar după ce s-a terminat verificarea (loading este false) */}
      {!loading && children}
      {loading && <div className="text-center mt-20">Se încarcă aplicația...</div>}
    </AuthContext.Provider>
  );
};

// Hook personalizat pentru acces facil la context (ex: const { currentUser } = useAuth();)
export const useAuth = () => useContext(AuthContext);