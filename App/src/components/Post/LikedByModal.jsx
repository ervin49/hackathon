// src/components/Post/LikedByModal.jsx (COMPLET)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import { getPostLikes } from '../../services/postService';

const LikedByModal = ({ postId, onClose }) => {
  const [likedUsers, setLikedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        setLoading(true);
        const users = await getPostLikes(postId);
        console.log("🔍 Utilizatori care au dat like:", users); // Pentru debug
        setLikedUsers(users);
      } catch (err) {
        console.error("Eroare la încărcarea like-urilor:", err);
        setError("Nu s-au putut încărca like-urile");
      } finally {
        setLoading(false);
      }
    };

    fetchLikes();
  }, [postId]);

  // Click pe background închide modalul
  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={handleBackgroundClick}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
    >
      <div 
        className="dark-card"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          width: '100%', 
          maxWidth: '500px', 
          maxHeight: '80vh', 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: '#1a1a1a',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '16px', 
            borderBottom: '1px solid #444'
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#f0f0f0', margin: 0 }}>
            Like-uri
          </h3>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#aaa', 
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#fff'}
            onMouseLeave={(e) => e.target.style.color = '#aaa'}
          >
            <FiX style={{ width: '24px', height: '24px' }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div 
                style={{ 
                  display: 'inline-block',
                  width: '32px',
                  height: '32px',
                  border: '4px solid #8a2be2',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}
              ></div>
              <p style={{ color: '#aaa', marginTop: '8px' }}>Se încarcă...</p>
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <p style={{ color: '#ef4444' }}>{error}</p>
            </div>
          )}

          {!loading && !error && likedUsers.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <p style={{ color: '#aaa' }}>Niciun like încă</p>
            </div>
          )}

          {!loading && !error && likedUsers.length > 0 && (
            // Limit visible items to 3; if there are more, show a scrollbar
            <div style={{ maxHeight: likedUsers.length > 3 ? '220px' : 'auto', overflowY: likedUsers.length > 3 ? 'auto' : 'visible', paddingRight: '6px' }}>
              {likedUsers.map((user) => (
                <Link
                  key={user.userId}
                  to={`/profile/${user.userId}`}
                  onClick={onClose}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '12px', 
                    borderRadius: '8px',
                    textDecoration: 'none',
                    transition: 'background-color 0.2s',
                    marginBottom: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <img 
                    src={user.profilePicture} 
                    alt={user.username}
                    style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '50%', 
                      objectFit: 'cover',
                      border: '2px solid #8a2be2'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ 
                      color: '#f0f0f0', 
                      fontWeight: '600',
                      margin: 0
                    }}>
                      {user.username}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LikedByModal;