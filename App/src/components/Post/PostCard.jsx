import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// 🌟 MODIFICAT: Importam FaHeart (Solid Heart) pe langa FiMessageCircle, FiShare2
import { FiMessageCircle, FiShare2 } from 'react-icons/fi'; 
import { FaHeart } from 'react-icons/fa'; // 🌟 NOU: Importam inima plina
import { FiHeart } from 'react-icons/fi'; // 🌟 Pastram inima goala

import { useAuth } from '../../context/AuthContext'; 
import { toggleLikePost, checkIfLiked } from '../../services/postService'; 

const PostCard = ({ post }) => {
  const data = post;
  const { currentUser } = useAuth(); 

  const [likesCount, setLikesCount] = useState(data.likes || 0); 
  const [isLiked, setIsLiked] = useState(false); 

  useEffect(() => {
    if (currentUser) {
      const checkLikeStatus = async () => {
        const liked = await checkIfLiked(data.id, currentUser.uid);
        setIsLiked(liked);
      };
      checkLikeStatus();
    }
  }, [data.id, currentUser]);

  const handleLike = async () => {
    if (!currentUser) {
      alert("Trebuie să fii logat pentru a da like!");
      return;
    }

    try {
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
      
      {/* Header Postare (Avatar si Nume) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
        <Link to={`/profile/${data.authorId}`}>
          <img 
            src={data.authorAvatar || 'https://via.placeholder.com/48/8a2be2/ffffff?text=U'} 
            alt={data.authorUsername} 
            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #8a2be2' }}
          />
        </Link>
        <div>
          <Link 
            to={`/profile/${data.authorId}`} 
            className="dark-text-light" 
            style={{ fontWeight: 'bold', textDecoration: 'none' }}
          >
            {data.authorUsername}
          </Link>
          <p className="dark-text-muted" style={{ fontSize: '12px' }}>{data.timestamp}</p>
        </div>
      </div>

      {/* Continutul Postarii */}
      <p className="dark-text-light" style={{ lineHeight: '1.6', marginBottom: '15px' }}>
        {data.content}
      </p>

      {/* 3. Butoane de Interactiuni */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #444', paddingTop: '12px' }}>
        
        {/* Buton LIKE actualizat */}
        <button 
            onClick={handleLike} 
            className={`icon-button ${isLiked ? 'icon-button-active' : ''}`}
        >
          {/* 🌟 LOGICA NOUA: Afisam FaHeart cand isLiked este true, altfel FiHeart */}
          {isLiked ? (
            <FaHeart 
              style={{ marginRight: '5px', color: '#ef4444' }} // Culoare direct pe FaHeart
              className="w-5 h-5" 
            />
          ) : (
            <FiHeart 
              style={{ marginRight: '5px' }} 
              className="w-5 h-5" 
            />
          )}
          {/* Contorul si textul raman cu stilul definit de icon-button-active */}
          <span style={{ fontSize: '14px' }}>{likesCount}</span>
        </button>

        {/* Buton COMENTARIU (ramane la fel) */}
        <button className="icon-button">
          <FiMessageCircle style={{ marginRight: '5px' }} className="w-5 h-5" />
          <span style={{ fontSize: '14px' }}>{data.commentsCount || 0}</span>
        </button>

        {/* Buton SHARE (ramane la fel) */}
        <button className="icon-button">
          <FiShare2 style={{ marginRight: '5px' }} className="w-5 h-5" />
          <span style={{ fontSize: '14px' }}>Share</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;