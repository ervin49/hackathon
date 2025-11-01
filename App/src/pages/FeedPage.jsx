import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/Post/PostCard'; 
import CreatePost from '../components/Layout/CreatePost'; 
import { getPosts } from '../services/postService'; 
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { FiMessageSquare, FiTrendingUp, FiUser, FiLogOut, FiHome } from 'react-icons/fi';

const FeedPage = () => {
  const { userData, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const goToMessages = () => {
    navigate('/messages');
  };

  const goToProfile = () => {
    if (currentUser?.uid) {
      navigate(`/profile/${currentUser.uid}`);
    }
  };

  const goToFeed = () => {
    navigate('/');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout Error:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  // Funcție de reîmprospătare
  const refreshPosts = async () => {
    try {
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
      setError(null);
    } catch (err) {
      console.error("Eroare la reîncărcarea postărilor:", err);
      setError("Nu am putut reîncărca postările.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPosts(); 
  }, []); 

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deleteDoc(doc(db, 'posts', postId));
      // Remove locally to keep UI snappy
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('Could not delete post. Check permissions and try again.');
    }
  };

  const username = userData?.username || 'User';

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#1a1625',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Sidebar Stânga - Navigație */}
      <aside style={{
        width: '280px',
        backgroundColor: '#231d30',
        borderRight: '1px solid #2d2640',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto'
      }}>
        {/* Logo/Brand (removed empty divider) */}

        {/* User Profile Card */}
        <div style={{
          backgroundColor: '#2d2640',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '32px',
          border: '1px solid #3d3650'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: '600',
              color: 'white'
            }}>
              {username.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{
                color: '#f9fafb',
                fontSize: '16px',
                fontWeight: '600',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {username}
              </h3>
              <p style={{
                color: '#9ca3af',
                fontSize: '13px',
                margin: '2px 0 0 0'
              }}>
                @{username.toLowerCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flex: 1
        }}>
          <button
            onClick={goToFeed}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              backgroundColor: 'transparent',
              color: '#e5e7eb',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2d2640';
              e.currentTarget.style.color = '#8b5cf6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#e5e7eb';
            }}
          >
            <FiHome style={{ width: '20px', height: '20px' }} />
            <span>Feed</span>
          </button>

          <button
            onClick={goToProfile}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              backgroundColor: 'transparent',
              color: '#e5e7eb',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2d2640';
              e.currentTarget.style.color = '#8b5cf6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#e5e7eb';
            }}
          >
            <FiUser style={{ width: '20px', height: '20px' }} />
            <span>Profile</span>
          </button>

          <button
            onClick={goToMessages}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              backgroundColor: 'transparent',
              color: '#e5e7eb',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2d2640';
              e.currentTarget.style.color = '#8b5cf6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#e5e7eb';
            }}
          >
            <FiMessageSquare style={{ width: '20px', height: '20px' }} />
            <span>Messages</span>
          </button>
        </nav>

        {/* Logout Button - Bottom */}
        <button
          onClick={handleLogout}
          className="logout-button sidebar-logout"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '24px'
          }}
        >
          <FiLogOut style={{ width: '18px', height: '18px' }} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content Area - Dreapta */}
      <main style={{
        flex: 1,
        marginLeft: '280px',
        paddingTop: '20px',
        paddingBottom: '40px'
      }}>
        {/* Container Principal Centrat */}
        <div style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          {/* Header */}
          <div style={{
            marginBottom: '24px',
            padding: '0 8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FiTrendingUp style={{
                width: '28px',
                height: '28px',
                color: '#8b5cf6'
              }} />
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#f9fafb',
                margin: 0
              }}>
                Feed
              </h1>
            </div>
          </div>

          {/* Zona de Creat Postare */}
          <div style={{
            backgroundColor: '#231d30',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
            border: '1px solid #2d2640'
          }}>
            <CreatePost onPostCreated={refreshPosts} />
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '60px 20px',
              color: '#8b5cf6',
              fontSize: '16px'
            }}>
              Se încarcă Feed-ul...
            </div>
          )}

          {/* Error State */}
          {error && (
            <div style={{
              backgroundColor: '#2d2640',
              border: '1px solid #ef4444',
              borderRadius: '12px',
              padding: '16px',
              color: '#ef4444',
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              {error}
            </div>
          )}

          {/* Feed-ul de Postări */}
          {!loading && !error && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {posts.length === 0 ? (
                <div style={{
                  backgroundColor: '#231d30',
                  borderRadius: '16px',
                  padding: '60px 40px',
                  textAlign: 'center',
                  border: '1px solid #2d2640'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: '#2d2640',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                  }}>
                    <FiTrendingUp style={{
                      width: '40px',
                      height: '40px',
                      color: '#6b7280'
                    }} />
                  </div>
                  <h3 style={{
                    color: '#9ca3af',
                    fontSize: '20px',
                    fontWeight: '600',
                    margin: '0 0 8px 0'
                  }}>
                    No posts yet
                  </h3>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '15px',
                    margin: 0
                  }}>
                    Be the first to share something!
                  </p>
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    style={{
                      backgroundColor: '#231d30',
                      borderRadius: '16px',
                      border: '1px solid #2d2640',
                      overflow: 'hidden',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#8b5cf6';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#2d2640';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    >
                    <PostCard 
                      post={{
                        ...post, 
                        timestamp: post.timestamp?.toDate().toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit', 
                          day: '2-digit', 
                          month: 'short' 
                        }) || 'just now'
                      }} 
                      onDelete={handleDeletePost}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FeedPage;