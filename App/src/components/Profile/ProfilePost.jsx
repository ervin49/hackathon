import React, { useState } from 'react';
import './ProfilePost.css';
import { FiHeart, FiMessageCircle, FiShare2 } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';

const ProfilePost = ({ post, author, showActions = true }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);

  // Merge author data: prefer fields from post.author but fall back to the `author` prop
  // This ensures that when rendering posts on a profile page we still show the profile's
  // selected avatar even if the individual post document lacks the avatar field.
  const authorData = {
    ...(author || {}),
    ...(post.author || {}),
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    let date = null;
    try {
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (timestamp.seconds) {
        // Firestore-like object
        date = new Date(timestamp.seconds * 1000);
      } else {
        date = new Date(timestamp);
      }
    } catch (e) {
      console.warn('Failed to parse timestamp', e, timestamp);
      return 'Unknown date';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <div className="profile-post">
      <div className="profile-post__header">
        <img
          src={authorData.profilePicture || authorData.avatar || '/default-avatar.svg'}
          alt={authorData.name || 'Author'}
          className="profile-post__author-avatar"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/default-avatar.svg'; }}
        />
        <div className="profile-post__author-info">
          <div className="profile-post__author-name">{authorData.name || authorData.displayName || authorData.username || 'Unknown'}</div>
          <div className="profile-post__timestamp">{formatDate(post.createdAt)}</div>
        </div>
      </div>

      <div className="profile-post__content">
        <p className="profile-post__text">{post.content}</p>
        {post.image && (
          <img 
            src={post.image} 
            alt="Post content" 
            className="profile-post__image"
          />
        )}
      </div>
      
      {showActions ? (
        <div className="profile-post__footer">
          <div className="profile-post__actions">
            <button 
              className={`profile-post__action ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              {isLiked ? <FaHeart /> : <FiHeart />}
              <span className="profile-post__action-count">{likesCount}</span>
            </button>
            <button className="profile-post__action">
              <FiMessageCircle />
              <span className="profile-post__action-count">{post.comments || 0}</span>
            </button>
            <button className="profile-post__action">
              <FiShare2 />
              <span className="profile-post__action-count">{post.shares || 0}</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProfilePost;