import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// Importă avatarul default
import { defaultAvatar } from '../../utils/avatarPaths'; 

const Header = () => {
  // userData ar trebui să conțină acum profilePicture și username
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
  
  // Preluăm URL-ul avatarului, cu fallback la defaultAvatar
  const avatarUrl = userData?.profilePicture || defaultAvatar;

  return (
    // ❗ Aplică clasa app-header
    <header className="app-header"> 
      
      {/* ❗ Aplică clasa app-logo */}
      <Link to="/" className="app-logo">
        ToGather
      </Link>
      
      <nav className="flex items-center space-x-4">
        {currentUser && userData ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            
            <Link 
              to={`/profile/${currentUser.uid}`} 
              className="header-link" // Clasa pentru link
              // 🛑 MODIFICARE STIL: Aliniere și font
              style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', fontWeight: '600' }}
            >
              {/* AFISAREA AVATARULUI */}
              <img 
                src={avatarUrl} 
                alt="Profile" 
                style={{ 
                  width: '30px', 
                  height: '30px', 
                  borderRadius: '50%', 
                  objectFit: 'cover', 
                  marginRight: '8px', 
                  border: '2px solid #8a2be2' 
                }} 
              />
              {/* 🛑 MODIFICARE STIL: Mărește scrisul la 1.1em */}
              <span style={{ fontSize: '1.1em' }}> 
                {userData.username}
              </span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="logout-button" 
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