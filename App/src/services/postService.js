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
    writeBatch, // 🌟 NOU: Pentru operații atomice (Like/Unlike)
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
    // Returnam postarea, redenumind campurile pentru a se potrivi cu PostCard.jsx
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
        userId, // Folosim userId (conform Firestore)
        userName, // Folosim userName (conform Firestore)
        content,
        timestamp: new Date(),
        likes: 0,
        commentsCount: 0,
    });
};

// -------------------------------------------------------------------
// 2. FUNCȚII PENTRU LIKE/UNLIKE
// -------------------------------------------------------------------

/**
 * Verifica daca un utilizator a dat like unei postari.
 * @param {string} postId ID-ul postarii.
 * @param {string} userId ID-ul utilizatorului.
 * @returns {boolean} True daca a dat like, false altfel.
 */
export const checkIfLiked = async (postId, userId) => {
    // Referinta catre documentul utilizatorului in subcolectia 'likes'
    const likeRef = doc(db, "posts", postId, "likes", userId);
    const docSnap = await getDoc(likeRef);
    return docSnap.exists();
};

/**
 * Adauga/Sterge like si actualizeaza contorul folosind o tranzactie (batch).
 * @param {string} postId ID-ul postarii.
 * @param {string} userId ID-ul utilizatorului.
 * @param {boolean} isCurrentlyLiked Starea curenta a like-ului.
 */
export const toggleLikePost = async (postId, userId, isCurrentlyLiked) => {
    const postRef = doc(db, "posts", postId);
    // Presupunem ca subcolectia de likes se numeste 'likes' (ca in exemplul tau Firestore)
    const likeRef = doc(db, "posts", postId, "likes", userId); 
    
    // Folosim un batch pentru a asigura ca ambele modificari (contor + subcolectie) se executa impreuna.
    const batch = writeBatch(db);

    if (isCurrentlyLiked) {
        // UNLIKE: Sterge documentul din subcolectie si decrementeaza contorul 'likes'
        batch.delete(likeRef);
        batch.update(postRef, {
            likes: increment(-1) // Decrementare atomica
        });
    } else {
        // LIKE: Creeaza documentul in subcolectie si incrementeaza contorul 'likes'
        batch.set(likeRef, { userId: userId, likedAt: new Date() });
        batch.update(postRef, {
            likes: increment(1) // Incrementare atomica
        });
    }

    await batch.commit();
};