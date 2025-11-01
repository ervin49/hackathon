// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Pentru redirecționare

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Obținem funcția de navigare

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // După logare cu succes, navigăm la pagina principală
      navigate('/'); 
    } catch (err) {
      alert('Eroare la logare: ' + err.message);
    }
  };
  
  // Aici trebuie adăugat și un formular pentru REGISTER care folosește createUserWithEmailAndPassword
  
  return (
    // ... formularul tău de login
  );
}
// ...