import { db } from './firebase'; 
import { collection, query, orderBy, getDocs, addDoc } from "firebase/firestore";

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
      // Mappam 'userId' si 'userName' la numele folosite in componenta PostCard
      authorId: data.userId, 
      authorUsername: data.userName,
    });
  });
  
  return posts;
};

// Functie pentru a crea o postare noua (Foloseste aceleasi denumiri ca in Firestore)
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