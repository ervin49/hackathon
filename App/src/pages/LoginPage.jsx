import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import WelcomeImage from '../assets/images/image.png'; // Assuming this is your imported image

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
          setError("Username is required.");
          setLoading(false);
          return;
        }
        await register(email, password, username);
      } else {
        await login(email, password);
      }
      
      navigate('/'); 
    } catch (err) {
      console.error("Firebase Error:", err.message);
      let errorMessage = "Authentication failed. Please check your credentials.";
      
      // Error handling based on Firebase codes
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already in use.";
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        errorMessage = "Incorrect email or password.";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "Password must be at least 6 characters long.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
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
              <a href="#" className="recovery-link">Forgot password?</a>
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
    </div>
  );
};

export default LoginPage;