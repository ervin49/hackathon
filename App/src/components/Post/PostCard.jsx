import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiMessageCircle, FiShare2 } from 'react-icons/fi'; 

const PostCard = ({ post }) => {
  const data = post;

  return (
    // ❗ Aplică clasa dark-card
    <div className="dark-card mb-6">
      
      {/* Header Postare (Avatar si Nume) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
        <Link to={`/profile/${data.authorId}`}>
          <img 
            src={data.authorAvatar || 'https://via.placeholder.com/48/8a2be2/ffffff?text=U'} // Placeholder default
            alt={data.authorUsername} 
            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #8a2be2' }}
          />
        </Link>
        <div>
          <Link 
            to={`/profile/${data.authorId}`} 
            className="dark-text-light" // ❗ Text alb
            style={{ fontWeight: 'bold', textDecoration: 'none' }}
          >
            {data.authorUsername}
          </Link>
          {/* ❗ Text gri pentru timestamp */}
          <p className="dark-text-muted" style={{ fontSize: '12px' }}>{data.timestamp}</p>
        </div>
      </div>

      {/* Continutul Postarii */}
      {/* ❗ Text alb pentru conținut */}
      <p className="dark-text-light" style={{ lineHeight: '1.6', marginBottom: '15px' }}>
        {data.content}
      </p>

      {/* 3. Butoane de Interactiuni */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #444', paddingTop: '12px' }}>
        
        {/* Buton LIKE */}
        <button className="icon-button">
          <FiHeart style={{ marginRight: '5px' }} className="w-5 h-5" />
          <span style={{ fontSize: '14px' }}>{data.likesCount || 0}</span>
        </button>

        {/* Buton COMENTARIU */}
        <button className="icon-button">
          <FiMessageCircle style={{ marginRight: '5px' }} className="w-5 h-5" />
          <span style={{ fontSize: '14px' }}>{data.commentsCount || 0}</span>
        </button>

        {/* Buton SHARE */}
        <button className="icon-button">
          <FiShare2 style={{ marginRight: '5px' }} className="w-5 h-5" />
          <span style={{ fontSize: '14px' }}>Share</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;