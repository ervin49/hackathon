// src/components/Post/CommentSection.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as postService from '../../services/postService'; // Folosim serviciul tău

const CommentSection = ({ postId, initialCount, onCommentAdded }) => {
  const { currentUser, userData } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true); // Schimbat la true pentru a afisa loading
  const [commentsCount, setCommentsCount] = useState(initialCount);

  // Funcție de preluare comentarii
  const fetchComments = async () => {
    setLoading(true);
    try {
      const fetchedComments = await postService.getComments(postId);
      setComments(fetchedComments);
    } catch (error) {
      console.error("Eroare la preluarea comentariilor:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    setCommentsCount(initialCount); // Sincronizăm contorul
  }, [postId, initialCount]); 

  // Funcție de trimitere a comentariului
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || newComment.trim() === '') return;

    try {
      const userId = currentUser.uid;
      const userName = userData?.username || currentUser.email.split('@')[0];
      
      await postService.addComment(postId, userId, userName, newComment.trim());
      
      setNewComment('');
      setCommentsCount(prev => prev + 1); // Actualizează contorul local vizual
      fetchComments(); // Reîncarcă lista
      if (onCommentAdded) onCommentAdded(); // Notifică PostCard-ul
    } catch (error) {
      alert("Nu s-a putut trimite comentariul.");
      console.error(error.message);
    }
  };

  // ----------------------------------------------------
  // UI de Afișare
  // ----------------------------------------------------

  return (
    <div className="comment-section" style={{ marginTop: '20px', borderTop: '1px solid #444', paddingTop: '15px' }}>
      <h4 style={{ color: '#f0f0f0', fontSize: '1em', marginBottom: '10px', fontWeight: 'bold' }}>Comentarii ({commentsCount})</h4>

      {/* Lista Comentarii */}
      <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '15px' }}>
        {loading ? (
            <p style={{ color: '#aaa', textAlign: 'center' }}>Se încarcă comentariile...</p>
        ) : comments.length > 0 ? (
            comments.map((c) => (
              <div key={c.id} style={{ borderBottom: '1px dotted #444', padding: '8px 0' }}>
                <p style={{ fontWeight: 'bold', color: '#8a2be2', fontSize: '0.95em', marginBottom: '3px' }}>@{c.authorName}</p>
                <p style={{ fontSize: '0.9em', color: '#ccc' }}>{c.content}</p>
              </div>
            ))
        ) : (
             <p style={{ color: '#aaa', textAlign: 'center', fontSize: '0.9em' }}>Fii primul care comentează!</p>
        )}
      </div>

      {/* Formular de Adăugare Comentariu (Vizibil doar dacă ești logat) */}
      {currentUser ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Adaugă un comentariu..."
            className="form-input" 
            required
          />
          <button 
            type="submit" 
            className="submit-button" 
            style={{ width: '100px', padding: '5px 10px', fontSize: '15px' }}
          >
            Trimite
          </button>
        </form>
      ) : (
        <p style={{ color: '#aaa', textAlign: 'center' }}>Trebuie să fii logat pentru a comenta.</p>
      )}
    </div>
  );
};

export default CommentSection;