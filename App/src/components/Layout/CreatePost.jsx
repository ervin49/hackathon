import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createPost } from '../../services/postService';

const CreatePost = ({ onPostCreated }) => { 
  const [postContent, setPostContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { userData, currentUser } = useAuth(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    const content = postContent.trim();
    if (content === '' || !currentUser || !userData) return; 

    setLoading(true);

    try {
      await createPost(
        currentUser.uid, 
        userData.username, 
        content
      );
      
      setPostContent(''); 
      onPostCreated(); 
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ❗ Aplică clasa dark-card
    <div className="dark-card mb-8">
      {/* ❗ Aplică clasa dark-text-light */}
      <h3 className="text-lg font-semibold dark-text-light mb-3">What's on your mind?</h3>
      
      {/* 🛑 MODIFICARE: Setăm formularul ca un container Flex column */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* Container pentru textarea, asigură width: 100% */}
        <div style={{ position: 'relative', width: '100%' }}>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder={`Share something, ${userData?.username || 'User'}...`}
              rows="3"
              // ❗ Aplică clasa post-input, asigură resize: none
              className="post-input" 
              required
              style={{ width: '100%', resize: 'none' }} // 🛑 Adăugat resize: none și width: 100%
            />
        </div>
        
        {/* 🛑 MODIFICARE: Alinierea butonului la dreapta */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button
            type="submit"
            // Butonul ramane mov, conform tematicii
            className="submit-button" 
            disabled={postContent.trim() === '' || loading}
            style={{ padding: '8px 20px', fontSize: '16px' }} 
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;