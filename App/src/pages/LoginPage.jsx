// src/pages/LoginPage.jsx (Cod COMPLET Modificat)

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import WelcomeImage from '../assets/images/image.png'; 
import { sendPasswordReset } from '../services/authService'; 

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Stări pentru modalul de resetare
  const [resetEmail, setResetEmail] = useState(''); 
  const [resetMessage, setResetMessage] = useState(''); 
  const [showResetForm, setShowResetForm] = useState(false); 
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        if (!username) {
          setError("Username is required.");
          setLoading(false);
          return;
        }
        await register(email, password, username);
        navigate('/'); // Navigare dupa inregistrare
      } else {
        // Logica de Login
        const user = await login(email, password); // 🛑 MODIFICARE: Preluăm obiectul user
        
        // 🛑 CORECȚIE CRITICĂ: Verificăm explicit succesul înainte de a naviga.
        if (user && user.uid) {
            navigate('/'); // Navigare doar dacă obiectul user este valid și ne-a logat.
        } else {
            // Aruncăm o eroare care va fi prinsă de blocul catch de mai jos.
            throw new Error("Login failed: Invalid user object returned.");
        }
      }
      
    } catch (err) {
      console.error("Firebase Error:", err.message);
      let errorMessage = "Authentication failed. Please check your credentials.";
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already in use.";
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = "Incorrect email or password.";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "Password must be at least 6 characters long.";
      } else if (err.message.includes("Login failed")) {
         // Prindem eroarea custom aruncată mai sus
         errorMessage = "A apărut o eroare la autentificare. Vă rugăm reîncercați.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Funcția care trimite email-ul de resetare
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetMessage('');
    
    if (!resetEmail) {
        setResetMessage("Please enter your email.");
        return;
    }

    try {
        await sendPasswordReset(resetEmail);
        setResetMessage("A password reset link has been sent to your email!");
    } catch (error) {
        console.error("Reset Error:", error);
        let errorMessage = "Error: Email not found or invalid.";
        if (error.code === 'auth/user-not-found') {
            errorMessage = "Error: The email address is not registered.";
        }
        setResetMessage(errorMessage);
    }
  };


  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* Form Column (Left) */}
        <div className="auth-form-column">
          <h2 className="auth-title">
            {isRegistering ? 'Create Account' : 'Hello Again!'}
          </h2>
          <p className="auth-subtitle">
            {isRegistering ? 'Join our community.' : "Let's start with your account."}
          </p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {isRegistering && (
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="form-input" 
                required
              />
            )}
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="form-input" 
              required
            />
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="form-input" 
              required
            />
            
            {!isRegistering && (
              // Deschide modalul la click
              <a href="#" onClick={(e) => { e.preventDefault(); setShowResetForm(true); }} className="recovery-link">Forgot password?</a>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="submit-button"
            >
              {loading ? 'Processing...' : isRegistering ? 'Sign Up' : 'Log In'}
            </button>
          </form>

          <div className="toggle-area">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="toggle-button"
            >
              {isRegistering
                ? "Already have an account? Log In."
                : "Don't have an account? Sign Up now."
              }
            </button>
          </div>
        </div>

        {/* Visual Column (Right) */}
        <div className="auth-image-column">
          <img 
            src={WelcomeImage}
            alt="Welcome to SocialHub" 
            className="auth-image"
          />
        </div>
      </div>
      
      {/* MODAL DE RESETARE PAROLĂ */}
      {showResetForm && (
        <div className="reset-password-overlay" style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.7)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 
        }}>
            <div style={{ padding: '30px', backgroundColor: '#2b2b2b', borderRadius: '10px', maxWidth: '400px', width: '90%' }}>
                <h3 style={{ color: 'white', marginBottom: '15px' }}>Reset Password</h3>
                <form onSubmit={handlePasswordReset}>
                    <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="form-input" 
                        required
                    />
                    {resetMessage && <p style={{ color: resetMessage.includes("Error") ? 'red' : 'lightgreen', margin: '10px 0' }}>{resetMessage}</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
                        <button type="button" onClick={() => setShowResetForm(false)} className="cancel-button" style={{ background: '#444' }}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-button" style={{ width: 'auto' }}>
                            Send Reset Link
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;