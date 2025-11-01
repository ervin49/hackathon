// src/components/Profile/EditProfile.jsx (Cod COMPLET Modificat)

import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
// 🛑 MODIFICARE: Importă lista de avatare
import { AVAILABLE_AVATARS } from '../../utils/avatarPaths'; 
import './EditProfile.css';

const EditProfile = ({ profileData, onClose, onUpdate }) => {
  // Păstrează stările tale existente
  const [formData, setFormData] = useState({
    displayName: profileData?.displayName || profileData?.username || '', 
    role: profileData?.role || '',
    bio: profileData?.bio || '',
    location: profileData?.location || '',
    company: profileData?.company || '',
  });
  
  // 🛑 NOU: State pentru avatarul selectat (folosește avatarul curent ca default)
  const [selectedAvatar, setSelectedAvatar] = useState(
    profileData?.profilePicture || AVAILABLE_AVATARS[0]
  );
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      
      // 🛑 MODIFICARE: Adaugă profilePicture la datele de actualizare
      const dataToUpdate = {
          ...formData,
          profilePicture: selectedAvatar, // Salvează noua cale locală
      };
      
      await updateDoc(userRef, dataToUpdate);
      
      // Notifică componenta părinte (ProfilePage) de schimbare, incluzând noul avatar
      onUpdate(dataToUpdate); 
      onClose();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-modal">
      <div className="edit-profile-content">
        <div className="edit-profile-header">
          <h2>Edit Profile</h2>
          <button onClick={onClose} className="close-button">
            &times;
          </button>
        </div>
        
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit} className="edit-profile-form">
            
            {/* 🛑 NOU: Secțiunea de Selecție Avatar 🛑 */}
            <div className="form-group avatar-selection">
                <label>Avatar de Profil</label>
                <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                    
                    {/* Afișează avatarul curent selectat */}
                    <img 
                        src={selectedAvatar} 
                        alt="Avatar Curent" 
                        style={{ 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '50%', 
                            objectFit: 'cover', 
                            marginRight: '20px', 
                            border: '3px solid #3B82F6',
                            flexShrink: 0
                        }} 
                    />
                    
                    {/* Lista de opțiuni de avatar */}
                    {AVAILABLE_AVATARS.map((avatarUrl, index) => (
                        <img 
                            key={index}
                            src={avatarUrl}
                            alt={`Avatar ${index + 1}`}
                            onClick={() => setSelectedAvatar(avatarUrl)}
                            style={{ 
                                width: '60px', 
                                height: '60px', 
                                borderRadius: '50%', 
                                cursor: 'pointer',
                                objectFit: 'cover',
                                border: selectedAvatar === avatarUrl ? '3px solid #EF4444' : '2px solid #D1D5DB',
                                transition: 'border 0.2s',
                                flexShrink: 0
                            }}
                        />
                    ))}
                </div>
            </div>
            {/* 🛑 SFÂRȘIT Secțiunea de Selecție Avatar 🛑 */}
            
            {/* Restul câmpurilor de editare (displayName, role, bio, etc.) */}
            <div className="form-group">
                <label htmlFor="displayName">Display Name</label>
                <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    placeholder="Enter your display name"
                />
            </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <input
              type="text"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Enter your role"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter your location"
            />
          </div>

          <div className="form-group">
            <label htmlFor="company">Company</label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Enter your company"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;