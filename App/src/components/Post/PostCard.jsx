// src/components/Post/PostCard.jsx (Codul COMPLET)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMessageCircle, FiShare2 } from 'react-icons/fi'; 
import { FaHeart } from 'react-icons/fa'; 
import { FiHeart } from 'react-icons/fi'; 

import { useAuth } from '../../context/AuthContext'; 
import { toggleLikePost, checkIfLiked } from '../../services/postService'; // 🛑 Logica Like
import CommentSection from './CommentSection.jsx'; // 🛑 Logica Comentarii

// Funcție ajutătoare pentru formatarea datei
const formatDate = (timestamp) => {
    if (timestamp instanceof Date) {
        return timestamp.toLocaleString('ro-RO', { dateStyle: 'medium', timeStyle: 'short' }); 
    }
    // Suportă formatul Firestore Timestamp (dacă e necesar)
    if (timestamp && timestamp.toDate) {
         return timestamp.toDate().toLocaleString('ro-RO', { dateStyle: 'medium', timeStyle: 'short' });
    }
    return 'Data Necunoscută';
};

const PostCard = ({ post }) => {
  const data = post;
  const { currentUser } = useAuth(); 

  // LOGICA LIKE
  const [likesCount, setLikesCount] = useState(data.likes || 0); 
  const [isLiked, setIsLiked] = useState(false); 
  
  // LOGICA COMENTARII
  const [commentsCount, setCommentsCount] = useState(data.commentsCount || 0);
  const [showComments, setShowComments] = useState(false); // Toggle pentru secțiunea Comentarii

  // 1. Efect de verificare LIKE (Persistență)
  useEffect(() => {
    // 🛑 CORECTIE PERSISTENTA: Se ruleaza doar daca avem un utilizator logat
    if (currentUser) {
      const checkLikeStatus = async () => {
        try {
          const liked = await checkIfLiked(data.id, currentUser.uid);
          setIsLiked(liked);
          setLikesCount(data.likes || 0); // Reincarca contorul initial
        } catch (error) {
          console.error("Eroare la verificarea stării de like:", error);
        }
      };
      checkLikeStatus();
    } else {
        setIsLiked(false);
    }
  }, [data.id, currentUser, data.likes]); // Adaugă data.likes în dependențe


  // 2. Funcția de Like/Unlike
  const handleLike = async () => {
    if (!currentUser) {
      alert("Trebuie să fii logat pentru a da like!");
      return;
    }

    try {
      // Folosește serviciul tău de like
      await toggleLikePost(data.id, currentUser.uid, isLiked);

      if (isLiked) {
        setLikesCount(prev => prev - 1);
      } else {
        setLikesCount(prev => prev + 1);
      }
      setIsLiked(prev => !prev);

    } catch (error) {
      console.error("Eroare la toggle like:", error);
      alert("Nu s-a putut actualiza like-ul.");
    }
  };

  return (
    <div className="dark-card mb-6">
      
      {/* Header Postare */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
        <Link to={`/profile/${data.userId}`}> 
          <img 
            src={data.authorAvatar || 'https://via.placeholder.com/48/3c3c3c/ffffff?text=U'} 
            alt={data.userName} 
            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #8a2be2' }}
          />
        </Link>
        <div>
          <Link 
            to={`/profile/${data.userId}`} 
            className="dark-text-light" 
            style={{ fontWeight: 'bold', textDecoration: 'none', color: '#93b5ff' }}
          >
            {data.userName}
          </Link>
          <p className="dark-text-muted" style={{ fontSize: '12px', color: '#aaa' }}>{formatDate(data.timestamp)}</p>
        </div>
      </div>

      {/* Continutul Postarii */}
      <p className="dark-text-light" style={{ lineHeight: '1.6', marginBottom: '15px', color: '#f0f0f0' }}>
        {data.content}
      </p>

      {/* 3. Butoane de Interactiuni */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '25px', borderTop: '1px solid #444', paddingTop: '12px' }}>
        
        {/* Buton LIKE */}
        <button 
            onClick={handleLike} 
            className={`icon-button ${isLiked ? 'icon-button-active' : ''}`}
        >
          {isLiked ? (
            <FaHeart style={{ marginRight: '5px', color: '#ef4444' }} className="w-5 h-5" />
          ) : (
            <FiHeart style={{ marginRight: '5px' }} className="w-5 h-5" />
          )}
          <span style={{ fontSize: '14px' }}>{likesCount}</span>
        </button>

        {/* Buton COMENTARIU */}
        <button 
            className="icon-button"
            onClick={() => setShowComments(prev => !prev)}
        >
          <FiMessageCircle style={{ marginRight: '5px' }} className="w-5 h-5" />
          <span style={{ fontSize: '14px' }}>{commentsCount}</span>
        </button>

        {/* Buton SHARE */}
        <button className="icon-button">
          <FiShare2 style={{ marginRight: '5px' }} className="w-5 h-5" />
          <span style={{ fontSize: '14px' }}>Share</span>
        </button>
      </div>

      {/* 🛑 Secțiunea de Comentarii */}
      {showComments && (
        <CommentSection 
          postId={data.id} 
          initialCount={commentsCount}
          // Incrementează contorul vizual din PostCard după ce un comentariu e adăugat
          onCommentAdded={() => setCommentsCount(prev => prev + 1)} 
        />
      )}
    </div>
  );
};

export default PostCard;