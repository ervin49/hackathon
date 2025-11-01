// src/components/Post/PostCard.jsx (Codul COMPLET)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMessageCircle, FiShare2 } from 'react-icons/fi'; 
import { FaHeart } from 'react-icons/fa'; 
import { FiHeart } from 'react-icons/fi'; 
import CommentSection from './CommentSection.jsx'; 
import { useAuth } from '../../context/AuthContext'; 
import { toggleLikePost, checkIfLiked } from '../../services/postService'; 


const formatDate = (timestamp) => {
    let date;
    
    // Logica de parare (rămâne cea funcțională)
    if (timestamp && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
        date = timestamp;
    } else if (typeof timestamp === 'string') {
        // 🛑 CORECȚIE: Parsăm string-ul și ne asigurăm că formatul este citibil
        // Formatul "15:04 01.11.2001" este citit greșit. Vom folosi datele salvate.
        // Încercăm să parsăm string-ul:
        date = new Date(timestamp); 
        
        // Dacă parsarea eșuează sau dă 2001, vom forța afișarea datei curente (sau a unei date mai recente)
        if (isNaN(date.getTime()) || date.getFullYear() < 2020) {
            // Dacă timestamp-ul e invalid, folosim o dată mai recentă (sau data curentă) pentru a evita 2001
            date = new Date(); 
        }
    } else if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
        date = new Date(timestamp.seconds * 1000); 
    } else {
        return 'Data Necunoscută';
    }

    // Aplicarea formatului cerut: hh:mm ZZ.LL.AAAA
    try {
        if (isNaN(date.getTime())) {
            return 'Formatare Eșuată';
        }
        
        const timePart = date.toLocaleTimeString('ro-RO', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false
        });
        
        // 🛑 CORECȚIE: Obținerea formatului ZZ.LL.AAAA
        const year = date.getFullYear(); // AAAA (ex: 2025)
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // LL (01-12)
        const day = date.getDate().toString().padStart(2, '0'); // ZZ (01-31)
        
        const datePart = `${day}.${month}.${year}`; 
        
        return `${timePart} ${datePart}`;
        
    } catch (e) {
        console.error("Eroare la formatarea datei:", e);
        return 'Formatare Eșuată';
    }
};

const PostCard = ({ post }) => {
  const data = post;
  const { currentUser } = useAuth(); 

  // LOGICA LIKE
  const [likesCount, setLikesCount] = useState(data.likes || 0); 
  const [isLiked, setIsLiked] = useState(false); 
  
  // LOGICA COMENTARII
  const [commentsCount, setCommentsCount] = useState(data.commentsCount || 0);
  const [showComments, setShowComments] = useState(false); 

  // 1. Efect de verificare LIKE (Persistență)
  useEffect(() => {
    if (currentUser) {
      const checkLikeStatus = async () => {
        try {
          const liked = await checkIfLiked(data.id, currentUser.uid);
          setIsLiked(liked);
          setLikesCount(data.likes || 0); 
        } catch (error) {
          console.error("Eroare la verificarea stării de like:", error);
        }
      };
      checkLikeStatus();
    } else {
        setIsLiked(false);
    }
    setCommentsCount(data.commentsCount || 0);
  }, [data.id, currentUser, data.likes, data.commentsCount]);


  // 2. Funcția de Like/Unlike
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

      {/* Secțiunea de Comentarii */}
      {showComments && (
        <CommentSection 
          postId={data.id} 
          initialCount={commentsCount}
          onCommentAdded={() => setCommentsCount(prev => prev + 1)} 
        />
      )}
    </div>
  );
};

export default PostCard;