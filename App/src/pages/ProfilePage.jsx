import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import EditProfile from '../components/Profile/EditProfile';

const ProfilePage = () => {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // 1. Preluare date profil (din colectia 'users')
        const userDocRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userDocRef);
        
        if (userSnap.exists()) {
          setProfileData(userSnap.data());
          
          // 2. Preluare postari specifice acestui user (din colectia 'posts')
          const postsRef = collection(db, 'posts');
          const q = query(postsRef, where('authorId', '==', userId));
          const postsSnap = await getDocs(q);
          
          const postsList = postsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setUserPosts(postsList);
          
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
  }, [userId]); // Rulăm la schimbarea ID-ului din URL

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

  if (loading) {
    return <div className="text-center mt-10">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Profile Information */}
      <div className="bg-white shadow-xl rounded-xl p-6 mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          {profileData.displayName || profileData.username}
        </h1>
        {profileData.role && (
          <p className="text-blue-600 text-lg mb-2">{profileData.role}</p>
        )}
        <p className="text-gray-600 mb-4">{profileData.bio}</p>
        
        <div className="flex justify-center gap-4 mb-4">
          {profileData.location && (
            <span className="text-gray-500">
              <i className="fas fa-map-marker-alt mr-2"></i>
              {profileData.location}
            </span>
          )}
          {profileData.company && (
            <span className="text-gray-500">
              <i className="fas fa-building mr-2"></i>
              {profileData.company}
            </span>
          )}
        </div>
        
        {/* Edit/Follow Button */}
        {currentUser && currentUser.uid === userId ? (
          <button 
            onClick={() => setIsEditMode(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-150"
          >
            Edit Profile
          </button>
        ) : (
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-150">
            Follow
          </button>
        )}
      </div>

      {/* Posts Section */}
      <h2 className="text-2xl font-bold mb-4 border-b pb-2">
        {profileData.displayName || profileData.username}'s Posts
      </h2>
      
      {userPosts.length > 0 ? (
        <div className="space-y-6">
          {userPosts.map(post => (
            <div key={post.id} className="bg-white p-4 shadow rounded-lg border border-gray-200">
              <p className="font-semibold text-gray-800">{post.content}</p>
              <p className="text-sm text-gray-500 mt-2">
                Posted on: {post.createdAt ? new Date(post.createdAt.toDate()).toLocaleDateString() : 'unknown date'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">This user hasn't posted anything yet.</p>
      )}

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