// src/components/CreatePost.jsx
import { useState } from 'react';
import { db, auth } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 
import { useAuth } from '../../hooks/useAuth'; // Pentru a accesa user-ul curent

function CreatePost({ onPostCreated }) { // Adăugăm un callback
  const [content, setContent] = useState('');
  const { currentUser } = useAuth();
  
  const handlePost = async (e) => {
    e.preventDefault();
    if (!currentUser || content.trim() === '') return;

    try {
      await addDoc(collection(db, 'posts'), {
        content: content,
        userId: currentUser.uid,
        userName: currentUser.email.split('@')[0], // Nume simplificat
        timestamp: serverTimestamp(),
        likes: 0
      });
      setContent('');
      if (onPostCreated) onPostCreated(); // Notificăm FeedPage că s-a creat o postare nouă
    } catch (error) {
      console.error('Eroare postare:', error);
    }
  };
  // ... returnează formularul cu textarea și butonul de submit
}
// ...