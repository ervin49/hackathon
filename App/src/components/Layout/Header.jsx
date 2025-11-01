import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Importăm hook-ul de autentificare

const Header = () => {
  const { currentUser, userData, logout } = useAuth(); // Preluăm starea userului și funcția de logout
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login'); // Redirecționează la pagina de login după logout
    } catch (error) {
      console.error("Eroare la delogare:", error);
      // Poți afișa un mesaj de eroare prietenos aici
      alert("Nu am putut efectua delogarea. Te rugăm să încerci din nou.");
    }
  };

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
      {/* Logo-ul/Numele aplicației */}
      <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition duration-200">
        SocialHub
      </Link>
      
      {/* Navigare (se adaptează dacă userul e logat sau nu) */}
      <nav className="flex items-center space-x-4">
        {currentUser ? (
          <>
            {/* Link către profilul utilizatorului logat */}
            <Link 
              to={`/profile/${currentUser.uid}`} 
              className="text-gray-700 hover:text-blue-500 font-medium transition duration-200"
            >
              {/* Afișează username-ul din Firestore dacă este disponibil */}
              {userData && userData.username ? userData.username : 'Profil'}
            </Link>
            
            {/* Buton de Logout */}
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-150 ease-in-out font-medium"
            >
              Logout
            </button>
          </>
        ) : (
          // Link către pagina de login dacă nu este logat
          <Link to="/login" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-150 ease-in-out font-medium">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;