import React, { useState } from 'react';
// import { useAuth } from '../../context/AuthContext'; // Va fi necesar pentru a prelua user-ul
// import { createPost } from '../../services/postService'; // Va fi necesar pentru a trimite postarea

const CreatePost = () => {
  const [postContent, setPostContent] = useState('');
  // const { userData } = useAuth(); // Va fi necesar cand vom implementa logica

  const handleSubmit = (e) => {
    e.preventDefault();
    if (postContent.trim() === '') {
      return; // Nu trimite postare goala
    }
    
    // Aici va veni logica de trimitere a postarii catre Firebase
    console.log('Postare trimisa (momentan, in consola):', postContent);
    
    // createPost(userData.uid, postContent); 
    setPostContent(''); // Golește câmpul după trimitere
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-lg mb-8 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Ce mai e nou?</h3>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder="Scrie o postare..."
          rows="3"
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
          required
        />
        
        {/* Buton de Postare */}
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-150 disabled:bg-gray-400"
            disabled={postContent.trim() === ''}
          >
            Postează
          </button>
        </div>
      </form>
    </div>
  );
};

// 🌟 SOLUȚIA: Exportul default pentru a se potrivi cu importul din FeedPage.jsx
export default CreatePost;