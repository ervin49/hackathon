import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import WelcomeImage from '../assets/images/image.png';
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        if (!username) {
          setError("Numele de utilizator este obligatoriu.");
          setLoading(false);
          return;
        }
        await register(email, password, username);
      } else {
        await login(email, password);
      }
      
      navigate('/'); 
    } catch (err) {
      console.error("Eroare Firebase:", err.message);
      let errorMessage = "Autentificarea a eșuat. Verifică datele.";
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "Acest email este deja folosit.";
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        errorMessage = "Email sau parolă incorecte.";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "Parola trebuie să aibă minim 6 caractere.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* Coloana de Formular (stânga) */}
        <div className="auth-form-column">
          <h2 className="auth-title">
            {isRegistering ? 'Crează un Cont' : 'Hello Again!'}
          </h2>
          <p className="auth-subtitle">
            {isRegistering ? 'Alătură-te comunității noastre.' : "Să începem cu contul tău."}
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
                placeholder="Nume de utilizator"
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
              placeholder="Parolă"
              className="form-input" 
              required
            />
            
            {!isRegistering && (
              <a href="#" className="recovery-link">Ai uitat parola?</a>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="submit-button"
            >
              {loading ? 'Se procesează...' : isRegistering ? 'Înregistrează-te' : 'Intră în Cont'}
            </button>
          </form>

          <div className="toggle-area">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="toggle-button"
            >
              {isRegistering
                ? "Ai deja un cont? Autentifică-te."
                : "Nu ai cont? Înregistrează-te acum."
              }
            </button>
          </div>
        </div>

        {/* Coloana Vizuală (dreapta) */}
        <div className="auth-image-column">
          <img 
            src={WelcomeImage}
            alt="Welcome" 
            className="auth-image"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;