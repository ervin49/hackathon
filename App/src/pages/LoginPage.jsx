import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Necesar doar la înregistrare
  const [isRegistering, setIsRegistering] = useState(false); // Toggle Login/Register
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth(); // Importăm funcțiile din context
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        // Logica de Inregistrare
        if (!username) {
          setError("Numele de utilizator este obligatoriu.");
          setLoading(false);
          return;
        }
        await register(email, password, username);
      } else {
        // Logica de Login
        await login(email, password);
      }
      
      // Navigare la feed după succes
      navigate('/'); 
    } catch (err) {
      console.error("Eroare Firebase:", err.message);
      // Mesaje de eroare mai clare pentru utilizator
      if (err.code === 'auth/email-already-in-use') {
        setError("Acest email este deja folosit.");
      } else if (err.code === 'auth/weak-password') {
        setError("Parola trebuie să aibă minim 6 caractere.");
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setError("Email sau parolă incorecte.");
      } else {
        setError(`A apărut o eroare: ${isRegistering ? 'Înregistrarea' : 'Autentificarea'} a eșuat.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-xl p-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
          {isRegistering ? 'Înregistrează-te' : 'Autentifică-te'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegistering && (
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nume utilizator"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
              required
            />
          )}

          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
            required
          />

          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Parolă (minim 6 caractere)"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
            required
          />

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full p-3 rounded-lg text-white font-semibold transition duration-150 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Se procesează...' : isRegistering ? 'Crează Cont' : 'Intră în Cont'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm text-blue-600 hover:text-blue-800 transition duration-150"
          >
            {isRegistering
              ? "Ai deja cont? Autentifică-te"
              : "Nu ai cont? Înregistrează-te"
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;