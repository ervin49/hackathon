// src/services/postService.js (Cod COMPLET Modificat)

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
    serverTimestamp // 🛑 NOU: Importă serverTimestamp
} from "firebase/firestore";

// 🛑 NOU: Importă avatarul de rezervă (pentru getPosts)
import { defaultAvatar } from '../utils/avatarPaths'; 


// -------------------------------------------------------------------
// 1. FUNCȚII DE BAZĂ (CITIRE / CREARE)
// -------------------------------------------------------------------

// Functie pentru a prelua toate postarile (pentru Feed)
export const getPosts = async () => {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, orderBy("timestamp", "desc"));
    
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    for (const postDoc of querySnapshot.docs) {
        const data = postDoc.data();
        
        const userSnap = await getDoc(doc(db, "users", data.userId));
        const userData = userSnap.exists() ? userSnap.data() : {};
        
        posts.push({
            id: postDoc.id,
            ...data,
            profilePicture: userData.profilePicture || defaultAvatar,
            authorId: data.userId, 
            authorUsername: data.userName,
        });
    }
    
    return posts;
};

// Functie pentru a crea o postare noua
export const createPost = async (userId, userName, content) => {
    return await addDoc(collection(db, "posts"), {
        userId, 
        userName, 
        content,
        // 🛑 CORECȚIE: Folosește serverTimestamp()
        timestamp: serverTimestamp(), 
        likes: 0,
        commentsCount: 0,
    });
};

// -------------------------------------------------------------------
// 2. FUNCȚII PENTRU LIKE/UNLIKE 
// -------------------------------------------------------------------

export const checkIfLiked = async (postId, userId) => {
    const likeRef = doc(db, "posts", postId, "likes", userId);
    const docSnap = await getDoc(likeRef);
    return docSnap.exists();
};

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
        batch.set(likeRef, { userId: userId, likedAt: serverTimestamp() }); // 🛑 CORECȚIE: Folosește serverTimestamp() și aici
        batch.update(postRef, {
            likes: increment(1) 
        });
    }

    await batch.commit();
};


// -------------------------------------------------------------------
// 3. FUNCȚII PENTRU COMENTARII 
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
        timestamp: serverTimestamp(), // 🛑 CORECȚIE: Folosește serverTimestamp()
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