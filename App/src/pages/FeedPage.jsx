// src/pages/FeedPage.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore'; 
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard'; // Presupunem că l-ai creat

function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [refresh, setRefresh] = useState(false); // Stare pentru reîmprospătare

  useEffect(() => {
    const fetchPosts = async () => {
      // Query pentru a ordona postările după timestamp (cele mai noi primele)
      const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc')); 
      const querySnapshot = await getDocs(q);
      
      setPosts(
        querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
    };

    fetchPosts();
  }, [refresh]); // Se rulează la prima încărcare și când 'refresh' se schimbă

  return (
    <div className="feed-page">
      <CreatePost onPostCreated={() => setRefresh(prev => !prev)} /> 
      {/* Când se creează un post, schimbăm starea 'refresh' pentru a reîncărca feed-ul */}
      
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      
    </div>
  );
}
// ...