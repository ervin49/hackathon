import React from 'react';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/Post/PostCard'; 
// Importă componenta pentru crearea de postări (o vom face funcțională în pasul următor)
import CreatePost from '../components/Layout/CreatePost'; 

// Date Fictive pentru a umple Feed-ul (vor fi înlocuite cu date din Firestore)
const mockPosts = [
  {
    id: 'p1',
    authorId: 'user123',
    authorUsername: 'ExplorerMatei',
    authorAvatar: 'https://cdn.pixabay.com/photo/2016/08/20/12/35/user-1606880_1280.png',
    content: 'Primul test în noul nostru Feed! Interfața arată fantastic cu Tailwind CSS.',
    timestamp: 'acum 5 minute',
    likesCount: 25,
    commentsCount: 5,
    mediaUrl: null,
  },
  {
    id: 'p2',
    authorId: 'user456',
    authorUsername: 'ReactDev',
    authorAvatar: 'https://cdn.pixabay.com/photo/2016/11/14/17/39/person-1824147_1280.png',
    content: 'Contextul de Autentificare funcționează perfect! Gata să implementăm crearea de postări mâine.',
    timestamp: 'acum 2 ore',
    likesCount: 150,
    commentsCount: 12,
    mediaUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  // Mai poți adăuga postări aici...
];

const FeedPage = () => {
  const { userData } = useAuth();
  
  // Numele utilizatorului logat
  const username = userData?.username || 'Utilizator';

  return (
    <div className="max-w-xl mx-auto p-4">
      {/* Mesajul de Bun Venit */}
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6">
        Salut, {username}!
      </h1>
      
      {/* 1. Zona de Creat Postare (Pasul Următor) */}
      <CreatePost />

      {/* 2. Feed-ul de Postări */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Postări Recente</h2>
        {mockPosts.map((post) => (
          // Randează componenta PostCard pentru fiecare postare
          <PostCard key={post.id} post={post} />
        ))}
        
        <p className="text-center text-gray-500 pt-4">Ai ajuns la finalul feed-ului static.</p>
      </div>
    </div>
  );
};

export default FeedPage;