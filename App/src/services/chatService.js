
// src/services/chatService.js

// Importă instanța Firestore și funcțiile necesare
import { db } from './firebase'; 
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  serverTimestamp,
} from 'firebase/firestore';

// --- Funcții utilitare ---

/**
 * Generează un ID de chat unic și consistent pentru doi utilizatori.
 * @returns {string} ID-ul chat-ului (ex: "uidA_uidB")
 */
export const generateChatId = (uid1, uid2) => {
  // Sortează ID-urile pentru a obține un ID unic, indiferent de ordinea în care sunt introduse uid-urile
  const sortedUids = [uid1, uid2].sort();
  return `${sortedUids[0]}_${sortedUids[1]}`;
};

// --- Funcții principale ---

/**
 * Actualizează documentul principal de chat (metadate).
 * Creează documentul dacă nu există (setDoc cu merge: true).
 */
const createOrUpdateChat = async (chatId, uidSender, uidReceiver, senderName, receiverName, lastMessageText) => {
  const chatRef = doc(db, 'chats', chatId);

  // Determină care UID este Uid1 și care este Uid2 (pentru a folosi numele corecte)
  const sortedUids = [uidSender, uidReceiver].sort();
  const isSenderUid1 = uidSender === sortedUids[0];
  
  const chatData = {
    // Array-ul de participanți este obligatoriu pentru căutare
    participants: sortedUids, 
    lastMessageText: lastMessageText,
    lastMessageTime: serverTimestamp(),
    
    // Asigură că user1Name/user2Name sunt salvate consistent
    user1Id: sortedUids[0],
    user2Id: sortedUids[1],
    user1Name: isSenderUid1 ? senderName : receiverName, 
    user2Name: isSenderUid1 ? receiverName : senderName,
    
    // Poți adăuga câmpuri pentru unreadCount aici, setate la 0 la inițiere
    // unreadCount: { [uidReceiver]: 1 } 
  };

  try {
    // setDoc cu { merge: true } creează documentul dacă nu există, altfel îl actualizează
    await setDoc(chatRef, chatData, { merge: true });
  } catch (e) {
    console.error("Eroare la crearea/actualizarea chat-ului:", e);
    throw new Error("Nu s-a putut crea sau actualiza chat-ul.");
  }
};

/**
 * 2. Adaugă un nou mesaj în sub-colecția 'messages' și actualizează chat-ul.
 * * @param {string} uidSender - UID-ul utilizatorului curent
 * @param {string} uidReceiver - UID-ul partenerului
 * @param {string} senderName - Numele utilizatorului curent
 * @param {string} receiverName - Numele partenerului
 * @param {string} messageText - Conținutul mesajului
 */
export const sendMessage = async (uidSender, uidReceiver, senderName, receiverName, messageText) => {
  const chatId = generateChatId(uidSender, uidReceiver);
  
  // 1. Actualizează/Creează documentul principal de chat cu metadatele
  await createOrUpdateChat(chatId, uidSender, uidReceiver, senderName, receiverName, messageText);

  // 2. Adaugă documentul mesajului în sub-colecția 'messages'
  const messagesCollectionRef = collection(db, 'chats', chatId, 'messages');
  
  const messageData = {
    senderId: uidSender,
    text: messageText,
    timestamp: serverTimestamp(),
    read: false,
  };

  try {
    await addDoc(messagesCollectionRef, messageData);
  } catch (e) {
    console.error("Eroare la trimiterea mesajului:", e);
    throw new Error("Nu s-a putut trimite mesajul.");
  }
};

/**
 * 3. Preluarea listei de conversații a unui utilizator. (Folosit de onSnapshot în MessagesPage)
 */
export const getUserChats = async (currentUserId) => {
    const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', currentUserId),
        orderBy('lastMessageTime', 'desc') 
    );

    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            lastMessageTime: doc.data().lastMessageTime?.toDate()
        }));
    } catch (e) {
        console.error("Eroare la preluarea listei de chat-uri:", e);
        throw new Error("Nu s-a putut prelua lista de conversații.");
    }
};

/**
 * 4. Preluarea mesajelor dintr-un chat specific. (Folosit de onSnapshot în MessagesPage)
 */
export const getChatMessages = async (chatId) => {
  if (!chatId) return [];
  
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('timestamp', 'asc')
  );

  try {
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    }));
  } catch (e) {
    console.error("Eroare la preluarea mesajelor:", e);
    throw new Error("Nu s-au putut prelua mesajele.");
  }
};