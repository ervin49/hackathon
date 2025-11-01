import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/Post/PostCard'; 
import CreatePost from '../components/Layout/CreatePost'; 
import { getPosts } from '../services/postService'; 
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { FiMessageSquare, FiTrendingUp, FiUser, FiLogOut, FiHome, FiCalendar, FiMapPin, FiClock, FiUsers, FiPlus, FiX } from 'react-icons/fi';

const FeedPage = () => {
  const { userData, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Events state
  const [events, setEvents] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    location: '',
    date: '',
    time: ''
  });

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

  // Load events
  useEffect(() => {
    const loadEvents = () => {
      const savedEvents = JSON.parse(localStorage.getItem('events') || '[]');
      setEvents(savedEvents);
    };
    loadEvents();
  }, []);

  // Save events
  const saveEvents = (updatedEvents) => {
    localStorage.setItem('events', JSON.stringify(updatedEvents));
    setEvents(updatedEvents);
  };

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.location || !newEvent.date || !newEvent.time) {
      alert('Please fill in all fields');
      return;
    }

    const event = {
      id: Date.now().toString(),
      ...newEvent,
      createdBy: currentUser?.uid,
      creatorName: username,
      attendees: [],
      createdAt: new Date().toISOString()
    };

    const updatedEvents = [...events, event];
    saveEvents(updatedEvents);
    setNewEvent({ title: '', location: '', date: '', time: '' });
    setShowCreateForm(false);
  };

  const handleAttendEvent = (eventId) => {
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        const isAttending = event.attendees.some(a => a.userId === currentUser?.uid);
        if (isAttending) {
          return {
            ...event,
            attendees: event.attendees.filter(a => a.userId !== currentUser?.uid)
          };
        } else {
          return {
            ...event,
            attendees: [...event.attendees, { userId: currentUser?.uid, username }]
          };
        }
      }
      return event;
    });
    saveEvents(updatedEvents);
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const updatedEvents = events.filter(e => e.id !== eventId);
      saveEvents(updatedEvents);
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
      backgroundColor: '#231d30',
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

      {/* Main Content Area - Centru */}
      <main style={{
        flex: 1,
        marginLeft: '280px',
        marginRight: '320px',
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

      {/* Sidebar Dreapta - Ieșiri */}
      <aside style={{
        width: '320px',
        backgroundColor: '#231d30',
        borderLeft: '1px solid #2d2640',
        padding: '24px',
        position: 'fixed',
        right: 0,
        height: '100vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiCalendar style={{ width: '24px', height: '24px', color: '#8b5cf6' }} />
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#f9fafb',
              margin: 0
            }}>
              Events
            </h2>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: showCreateForm ? '#ef4444' : '#8b5cf6',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {showCreateForm ? (
              <FiX style={{ width: '20px', height: '20px', color: 'white' }} />
            ) : (
              <FiPlus style={{ width: '20px', height: '20px', color: 'white' }} />
            )}
          </button>
        </div>

        {/* Create Event Form */}
        {showCreateForm && (
          <div style={{
            backgroundColor: '#2d2640',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            border: '1px solid #3d3650'
          }}>
            <input
              type="text"
              placeholder="Title of Event"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#1a1625',
                border: '1px solid #3d3650',
                borderRadius: '8px',
                color: '#f9fafb',
                fontSize: '14px',
                marginBottom: '12px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <input
              type="text"
              placeholder="Location"
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#1a1625',
                border: '1px solid #3d3650',
                borderRadius: '8px',
                color: '#f9fafb',
                fontSize: '14px',
                marginBottom: '12px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#1a1625',
                border: '1px solid #3d3650',
                borderRadius: '8px',
                color: '#f9fafb',
                fontSize: '14px',
                marginBottom: '12px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <input
              type="time"
              value={newEvent.time}
              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#1a1625',
                border: '1px solid #3d3650',
                borderRadius: '8px',
                color: '#f9fafb',
                fontSize: '14px',
                marginBottom: '12px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <button
              onClick={handleCreateEvent}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#8b5cf6',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}
            >
              Create Event
            </button>
          </div>
        )}

        {/* Events List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {events.length === 0 ? (
            <div style={{
              backgroundColor: '#2d2640',
              borderRadius: '12px',
              padding: '32px 20px',
              textAlign: 'center',
              border: '1px solid #3d3650'
            }}>
              <FiCalendar style={{
                width: '40px',
                height: '40px',
                color: '#6b7280',
                margin: '0 auto 12px'
              }} />
              <p style={{
                color: '#9ca3af',
                fontSize: '14px',
                margin: 0
              }}>
                There are no events yet. Create one to get started!
              </p>
            </div>
          ) : (
            events.map(event => {
              const isAttending = event.attendees.some(a => a.userId === currentUser?.uid);
              const isCreator = event.createdBy === currentUser?.uid;

              return (
                <div
                  key={event.id}
                  style={{
                    backgroundColor: '#2d2640',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #3d3650',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#3d3650'}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}>
                    <h3 style={{
                      color: '#f9fafb',
                      fontSize: '16px',
                      fontWeight: '600',
                      margin: 0,
                      flex: 1
                    }}>
                      {event.title}
                    </h3>
                    {isCreator && (
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#ef4444'
                        }}
                      >
                        <FiX style={{ width: '16px', height: '16px' }} />
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiMapPin style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
                      <span style={{ color: '#9ca3af', fontSize: '13px' }}>{event.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiClock style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
                      <span style={{ color: '#9ca3af', fontSize: '13px' }}>
                        {new Date(event.date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })} at {event.time}
                      </span>
                    </div>
                  </div>

                  {/* Attendees */}
                  {event.attendees.length > 0 && (
                    <div style={{
                      backgroundColor: '#1a1625',
                      borderRadius: '8px',
                      padding: '10px',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '8px'
                      }}>
                        <FiUsers style={{ width: '14px', height: '14px', color: '#8b5cf6' }} />
                        <span style={{ color: '#9ca3af', fontSize: '12px', fontWeight: '600' }}>
                          {event.attendees.length} {event.attendees.length === 1 ? 'participant' : 'participants'}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px'
                      }}>
                        {event.attendees.map((attendee, idx) => (
                          <span
                            key={idx}
                            onClick={() => navigate(`/profile/${attendee.userId}`)}
                            style={{
                              backgroundColor: '#2d2640',
                              color: '#e5e7eb',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#8b5cf6';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#2d2640';
                              e.currentTarget.style.color = '#e5e7eb';
                            }}
                          >
                            @{attendee.username}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleAttendEvent(event.id)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: isAttending ? '#10b981' : '#8b5cf6',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    {isAttending ? "✓ I'm Coming" : "I'm Coming"}
                  </button>

                  <div 
                    onClick={() => navigate(`/profile/${event.createdBy}`)}
                    style={{
                      marginTop: '8px',
                      fontSize: '11px',
                      color: '#6b7280',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#8b5cf6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#6b7280';
                    }}
                  >
                    created by {event.creatorName}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
};

export default FeedPage;