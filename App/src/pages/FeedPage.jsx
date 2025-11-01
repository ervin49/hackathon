import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/Post/PostCard'; 
import CreatePost from '../components/Layout/CreatePost'; 
import { getPosts } from '../services/postService'; 

const FeedPage = () => {
  const { userData } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Funcție de reîmprospătare (o vom folosi după ce se creează o postare nouă)
  const refreshPosts = async () => {
      try {
          const fetchedPosts = await getPosts();
          setPosts(fetchedPosts);
          setError(null);
      } catch (err) {
          console.error("Eroare la reîncărcarea postărilor:", err);
          setError("Nu am putut reîncărca postările.");
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    // Ruleaza functia de preluare a postarilor la incarcarea paginii
    refreshPosts(); 
  }, []); 

  if (loading) {
    return <div className="text-center mt-20 text-gray-400">Se încarcă Feed-ul...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-500">{error}</div>;
  }
  
  const username = userData?.username || 'User';

  return (
    <div className="max-w-xl mx-auto p-4 pt-8">
      
      {/* 1. Zona de Creat Postare (Trimitem functia de refresh ca prop) */}
      <CreatePost onPostCreated={refreshPosts} />

      {/* 2. Feed-ul de Postări */}
      <div className="space-y-6 mt-8">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Latest Posts</h2>
        
        {posts.length === 0 ? (
            <p className="text-gray-500 text-center">No posts yet. Be the first to share!</p>
        ) : (
            posts.map((post) => (
                <PostCard 
                    key={post.id} 
                    post={{
                        ...post, 
                        // Conversia obiectului Timestamp de la Firebase la un string lizibil
                        timestamp: post.timestamp?.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) || 'just now'
                    }} 
                />
            ))
        )}
      </div>
    </div>
  );
};

export default FeedPage;