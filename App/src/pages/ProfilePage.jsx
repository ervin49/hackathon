import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  runTransaction,
  serverTimestamp,
  increment,
  orderBy
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import EditProfile from '../components/Profile/EditProfile';
import ProfilePost from '../components/Profile/ProfilePost';
import './ProfilePage.css';

const ProfilePage = () => {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // 1. Preluare date profil (din colectia 'users')
        const userDocRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userDocRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfileData(data);

          // 2. Preluare postari specifice acestui user (din colectia 'posts')
          const postsRef = collection(db, 'posts');
          // Prefer ordered query by timestamp (desc). If Firestore requires an index and throws,
          // fall back to the simple where query so the profile still shows posts.
          let postsSnap;
          try {
            const orderedQ = query(postsRef, where('userId', '==', userId), orderBy('timestamp', 'desc'));
            postsSnap = await getDocs(orderedQ);
          } catch (err) {
            console.warn('Ordered posts query failed, falling back to unordered query:', err);
            const q = query(postsRef, where('userId', '==', userId));
            postsSnap = await getDocs(q);
          }

          const postsList = postsSnap.docs.map(docSnap => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              ...data,
              // normalize fields expected by ProfilePost
              author: {
                id: data.userId || data.authorId || userId,
                name: data.userName || data.userName || (profileData && (profileData.displayName || profileData.username)) || 'Unknown',
                avatar: profileData?.profilePicture || profileData?.avatar || data.avatar || '/default-avatar.svg'
              },
              createdAt: data.timestamp || data.createdAt || null,
              likes: data.likes || data.likesCount || 0,
              comments: data.commentsCount || 0,
              image: data.image || null,
            };
          });
          setUserPosts(postsList);

          // 3. Check if currentUser follows this profile
          if (currentUser) {
            const followerRef = doc(db, 'users', userId, 'followers', currentUser.uid);
            const followerSnap = await getDoc(followerRef);
            setIsFollowing(!!followerSnap.exists());
          }

        } else {
          setError("Utilizatorul nu a fost găsit.");
        }

      } catch (err) {
        console.error("Eroare la preluarea profilului:", err);
        setError("Eroare la încărcarea datelor.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, currentUser]); // Rulăm la schimbarea ID-ului sau a autentificarii

  if (loading) {
    return <div className="text-center mt-10">Se încarcă profilul...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-600">{error}</div>;
  }
  
  // ----------------------------------------------------
  // 🎉 Structura vizuala a paginii de Profil
  // ----------------------------------------------------
  const handleProfileUpdate = (updatedData) => {
    setProfileData(prevData => ({
      ...prevData,
      ...updatedData
    }));
  };

  // Follow / Unfollow logic using a lightweight transactional approach.
  const handleFollowToggle = async () => {
    if (!currentUser) return alert('You must be signed in to follow users.');
    if (currentUser.uid === userId) return; // can't follow yourself

    setFollowLoading(true);
    try {
      const profileRef = doc(db, 'users', userId);
      const myRef = doc(db, 'users', currentUser.uid);
      const followerRef = doc(db, 'users', userId, 'followers', currentUser.uid);
      const followingRef = doc(db, 'users', currentUser.uid, 'following', userId);

      await runTransaction(db, async (transaction) => {
        const followerSnap = await transaction.get(followerRef);

        if (followerSnap.exists()) {
          // unfollow: delete follower/following docs and decrement counts
          transaction.delete(followerRef);
          transaction.delete(followingRef);
          transaction.update(profileRef, { followers: increment(-1) });
          transaction.update(myRef, { following: increment(-1) });
        } else {
          // follow: create follower/following docs and increment counts
          transaction.set(followerRef, { uid: currentUser.uid, since: serverTimestamp() });
          transaction.set(followingRef, { uid: userId, since: serverTimestamp() });
          transaction.update(profileRef, { followers: increment(1) });
          transaction.update(myRef, { following: increment(1) });
        }
      });

      // Toggle local state and reflect count change locally for snappy UI
      setIsFollowing(prev => !prev);
      setProfileData(prev => ({
        ...prev,
        followers: prev && typeof prev.followers === 'number' ? prev.followers + (isFollowing ? -1 : 1) : (isFollowing ? 0 : 1)
      }));

    } catch (err) {
      console.error('Follow/unfollow error:', err);
      alert('Could not update follow state. Try again.');
    } finally {
      setFollowLoading(false);
    }
  };

  // Click handler for the follow button in the UI: redirect to login if unauthenticated
  const handleFollowClick = () => {
    if (!currentUser) {
      // redirect to login
      navigate('/login');
      return;
    }
    if (currentUser.uid === userId) return; // no-op when it's your own profile
    handleFollowToggle();
  };

  const displayName = profileData.displayName || profileData.username || 'Anonymous';

  return (
    <div className="profile-page-root">
  <div className="profile-container">
        {/* Left column: Profile Card */}
        <aside className="profile-left-card">
          <div className="profile-hero">
            <div className="profile-avatar-wrap">
              <img
                src={profileData.profilePicture || profileData.avatar || '/default-avatar.svg'}
                alt="Avatar"
                className="profile-avatar"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/default-avatar.svg'; }}
              />
            </div>
              <div className="profile-hero-info">
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px'}}>
                  <h1 className="profile-name">{displayName}</h1>
                  <div>
                    {/* Inline follow button near name */}
                    {currentUser && currentUser.uid !== userId ? (
                      <button className={`btn btn-follow inline-follow ${isFollowing ? 'following' : ''}`} onClick={handleFollowClick} disabled={followLoading}>
                        {followLoading ? 'Updating...' : isFollowing ? 'Unfollow' : 'Follow'}
                      </button>
                    ) : !currentUser ? (
                      <button className="btn btn-follow inline-follow" onClick={handleFollowClick}>Follow</button>
                    ) : null}
                  </div>
                </div>
                {profileData.role && <div className="profile-role">{profileData.role}</div>}
                <p className="profile-bio">{profileData.bio}</p>
              </div>
          </div>

          <div className="profile-stats">
            <div className="stat">
              <div className="stat-value">{userPosts.length || 0}</div>
              <div className="stat-label">Posts</div>
            </div>
            <div className="stat">
              <div className="stat-value">{(typeof profileData.followers === 'number') ? profileData.followers : 0}</div>
              <div className="stat-label">Followers</div>
            </div>
            <div className="stat">
              <div className="stat-value">{(typeof profileData.following === 'number') ? profileData.following : 0}</div>
              <div className="stat-label">Following</div>
            </div>
          </div>

          <div className="profile-actions">
            {currentUser && currentUser.uid === userId ? (
              <button className="btn btn-edit" onClick={() => setIsEditMode(true)}>Edit Profile</button>
            ) : (
              /* Removed big follow button because inline follow is present near the name */
              null
            )}
          </div>

          <div className="profile-meta">
            {profileData.location && <div className="meta-row">📍 {profileData.location}</div>}
            {profileData.company && <div className="meta-row">🏢 {profileData.company}</div>}
            {profileData.website && <div className="meta-row">🔗 <a href={profileData.website} target="_blank" rel="noreferrer">{profileData.website}</a></div>}
          </div>
        </aside>

        {/* Right column: Posts */}
        <main className="profile-right-posts">
          <div className="posts-header">
            <h2>Posts</h2>
            <div className="posts-count">{userPosts.length || 0} {userPosts.length === 1 ? 'post' : 'posts'}</div>
          </div>

          <div className="posts-list">
            {userPosts.length > 0 ? (
              userPosts.map(post => (
                <ProfilePost key={post.id} post={post} author={profileData} showActions={false} />
              ))
            ) : (
              <div className="empty-posts">This user hasn't posted anything yet.</div>
            )}
          </div>
        </main>
      </div>

      {/* Edit Profile Modal */}
      {isEditMode && (
        <EditProfile
          profileData={profileData}
          onClose={() => setIsEditMode(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}

export default ProfilePage;