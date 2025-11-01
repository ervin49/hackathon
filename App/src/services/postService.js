// src/services/postService.js (Cod COMPLET)

import { db } from './firebase'; 
import { 
    collection, 
    query, 
    orderBy, 
    getDocs, 
    addDoc,
    doc, 
    getDoc, 
    increment, 
    writeBatch, 
} from "firebase/firestore";

// -------------------------------------------------------------------
// 1. FUNCȚII DE BAZĂ (CITIRE / CREARE)
// -------------------------------------------------------------------

// Functie pentru a prelua toate postarile (pentru Feed)
export const getPosts = async () => {
    // ATENTIE: Folosim numele de campuri din baza ta de date: 'timestamp' si 'userName'
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
            id: doc.id,
            ...data,
            // Mapare pentru a se potrivi cu PostCard.jsx
            authorId: data.userId, 
            authorUsername: data.userName,
        });
    });
    
    return posts;
};

// Functie pentru a crea o postare noua
export const createPost = async (userId, userName, content) => {
    return await addDoc(collection(db, "posts"), {
        userId, 
        userName, 
        content,
        timestamp: new Date(),
        likes: 0,
        commentsCount: 0,
    });
};

// -------------------------------------------------------------------
// 2. FUNCȚII PENTRU LIKE/UNLIKE (Preluat din logica ta stabila)
// -------------------------------------------------------------------

/**
 * Verifica daca un utilizator a dat like unei postari.
 */
export const checkIfLiked = async (postId, userId) => {
    const likeRef = doc(db, "posts", postId, "likes", userId);
    const docSnap = await getDoc(likeRef);
    return docSnap.exists();
};

/**
 * Adauga/Sterge like si actualizeaza contorul folosind un batch.
 */
export const toggleLikePost = async (postId, userId, isCurrentlyLiked) => {
    const postRef = doc(db, "posts", postId);
    const likeRef = doc(db, "posts", postId, "likes", userId); 
    
    const batch = writeBatch(db);

    if (isCurrentlyLiked) {
        batch.delete(likeRef);
        batch.update(postRef, {
            likes: increment(-1) 
        });
    } else {
        batch.set(likeRef, { userId: userId, likedAt: new Date() });
        batch.update(postRef, {
            likes: increment(1) 
        });
    }

    await batch.commit();
};


// -------------------------------------------------------------------
// 3. FUNCȚII PENTRU COMENTARII (NOU)
// -------------------------------------------------------------------

const postsCollection = "posts";
const commentsCollection = "comments";

export const addComment = async (postId, userId, userName, content) => {
    const postRef = doc(db, postsCollection, postId);
    const commentRef = collection(db, postsCollection, postId, commentsCollection); 
    
    const batch = writeBatch(db);

    // 1. Adaugă documentul comentariului
    const newCommentRef = doc(commentRef); 
    batch.set(newCommentRef, {
        authorId: userId,
        authorName: userName,
        content: content,
        timestamp: new Date(),
    });

    // 2. Incrementează contorul commentsCount
    batch.update(postRef, {
        commentsCount: increment(1)
    });

    await batch.commit();
};


export const getComments = async (postId) => {
    const commentsRef = collection(db, postsCollection, postId, commentsCollection);
    const q = query(commentsRef, orderBy('timestamp', 'asc')); 
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};