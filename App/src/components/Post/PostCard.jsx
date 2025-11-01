import React from 'react';
import { Link } from 'react-router-dom';
// Simulam importul iconitelor (asigura-te ca ai instalat react-icons)
// npm install react-icons
import { FiHeart, FiMessageCircle, FiShare2 } from 'react-icons/fi'; 

// Definim o componenta care primeste un obiect 'post' ca prop
const PostCard = ({ post }) => {
  // Datele statice de fallback sunt bune pentru testarea initiala
  const defaultPost = {
    id: 1,
    authorId: 'defaultUser',
    authorUsername: 'UtilizatorTest',
    authorAvatar: 'https://via.placeholder.com/150/0000FF/808080?Text=U', // Avatar default
    content: 'Aceasta este prima postare a proiectului de social media! Suntem incantati ca merge!',
    timestamp: new Date().toLocaleTimeString(),
    likesCount: 15,
    commentsCount: 3,
    mediaUrl: null, // Poate fi o imagine
  };

  const data = post || defaultPost;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5 mb-6 transition duration-300 hover:shadow-xl">
      
      {/* 1. Header Postare (Avatar si Nume) */}
      <div className="flex items-center space-x-3 mb-4">
        <Link to={`/profile/${data.authorId}`}>
          <img 
            src={data.authorAvatar} 
            alt={data.authorUsername} 
            className="w-12 h-12 rounded-full object-cover border-2 border-blue-400"
          />
        </Link>
        <div>
          <Link 
            to={`/profile/${data.authorId}`} 
            className="font-bold text-gray-800 hover:text-blue-600 transition duration-150"
          >
            {data.authorUsername}
          </Link>
          <p className="text-xs text-gray-500">{data.timestamp}</p>
        </div>
      </div>

      {/* 2. Continutul Postarii */}
      <p className="text-gray-700 leading-relaxed mb-4">
        {data.content}
      </p>

      {/* Media (Daca exista) */}
      {data.mediaUrl && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img 
            src={data.mediaUrl} 
            alt="Media postare" 
            className="w-full h-auto object-cover max-h-96" 
          />
        </div>
      )}

      {/* 3. Butoane de Interactiuni */}
      <div className="flex justify-between items-center border-t border-gray-100 pt-3">
        {/* Buton LIKE */}
        <button className="flex items-center text-gray-500 hover:text-red-500 space-x-1 transition duration-150">
          <FiHeart className="w-5 h-5" />
          <span className="font-semibold text-sm">{data.likesCount}</span>
        </button>

        {/* Buton COMENTARIU */}
        <button className="flex items-center text-gray-500 hover:text-blue-500 space-x-1 transition duration-150">
          <FiMessageCircle className="w-5 h-5" />
          <span className="font-semibold text-sm">{data.commentsCount}</span>
        </button>

        {/* Buton SHARE */}
        <button className="flex items-center text-gray-500 hover:text-green-500 space-x-1 transition duration-150">
          <FiShare2 className="w-5 h-5" />
          <span className="font-semibold text-sm">Distribuie</span>
        </button>
      </div>
      
      {/* Zona pentru comentarii (se adauga mai tarziu) */}
      {/* <CommentSection postId={data.id} /> */}

    </div>
  );
};

export default PostCard;