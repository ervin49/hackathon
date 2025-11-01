// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged este ascultătorul care menține starea de autentificare
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });
    return unsubscribe; // Curățare la demontare
  }, []);

  return { 
    currentUser, 
    isLoading, 
    isAuthenticated: !!currentUser // Returnează true dacă currentUser NU este null
  };
};