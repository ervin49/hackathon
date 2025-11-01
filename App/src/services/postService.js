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
// src/services/postService.js (ADĂUGAT: Funcții pentru Evenimente)

// -------------------------------------------------------------------
// 5. FUNCȚII PENTRU EVENIMENTE (IEȘIRI)
// -------------------------------------------------------------------

const EVENT_COLLECTION = "events"; 

// 1. Creează un eveniment nou în Firestore
export const createEventFirestore = async (eventData) => {
    const eventRef = collection(db, EVENT_COLLECTION);
    return await addDoc(eventRef, { ...eventData, createdAt: new Date() });
};

// 2. Încarcă toate evenimentele din Firestore
export const getEventsFirestore = async () => {
    const eventsRef = collection(db, EVENT_COLLECTION);
    // Sortăm după data creării (cel mai recent, primul)
    const q = query(eventsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

// 3. Actualizează un eveniment (folosit pentru Attend/Participă)
export const updateEventFirestore = async (eventId, data) => {
    const eventRef = doc(db, EVENT_COLLECTION, eventId);
    return await updateDoc(eventRef, data);
};

// 4. Șterge un eveniment
export const deleteEventFirestore = async (eventId) => {
    const eventRef = doc(db, EVENT_COLLECTION, eventId);
    return await deleteDoc(eventRef);
};
