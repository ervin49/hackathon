import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout Error:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    // ❗ Aplică clasa app-header
    <header className="app-header"> 
      
      {/* ❗ Aplică clasa app-logo */}
      <Link to="/" className="app-logo">
        SocialHub
      </Link>
      
      <nav className="flex items-center space-x-4">
        {currentUser && userData ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link 
              to={`/profile/${currentUser.uid}`} 
              className="header-link" // Clasa pentru link
            >
              {userData.username}
            </Link>
            
            <button
              onClick={handleLogout}
              className="logout-button" // Clasa pentru butonul Logout
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="header-link">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;