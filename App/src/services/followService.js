// src/services/followService.js
import { db } from './firebase';
import { 
    collection, 
    doc, 
    getDoc,
    getDocs,
    query,
    orderBy,
    writeBatch,
    serverTimestamp,
    deleteDoc,
    setDoc
} from "firebase/firestore";

import { defaultAvatar } from '../utils/avatarPaths';

// Verifică dacă un utilizator îl urmărește pe altul
export const checkIfFollowing = async (followerId, followedId) => {
    const followRef = doc(db, "users", followedId, "followers", followerId);
    const docSnap = await getDoc(followRef);
    return docSnap.exists();
};

// Urmărește/nu mai urmări un utilizator
export const toggleFollow = async (followerId, followedId, isCurrentlyFollowing) => {
    const followerRef = doc(db, "users", followedId, "followers", followerId);
    const followingRef = doc(db, "users", followerId, "following", followedId);
    
    const batch = writeBatch(db);

    if (isCurrentlyFollowing) {
        // Șterge din ambele colecții (followers și following)
        batch.delete(followerRef);
        batch.delete(followingRef);
    } else {
        // Adaugă în ambele colecții
        const timestamp = serverTimestamp();
        batch.set(followerRef, { 
            followerId,
            timestamp
        });
        batch.set(followingRef, {
            followedId,
            timestamp
        });
    }

    await batch.commit();
};

// Obține lista de followers pentru un utilizator
export const getFollowers = async (userId) => {
    try {
        console.log('🔍 Încercăm să preluăm followers pentru userId:', userId);
        const followersRef = collection(db, "users", userId, "followers");
        const q = query(followersRef, orderBy("timestamp", "desc"));
        
        const querySnapshot = await getDocs(q);
        console.log(`📊 Am găsit ${querySnapshot.size} followers în Firestore`);
        const followers = [];
        
        for (const followerDoc of querySnapshot.docs) {
            const followerData = followerDoc.data();
            console.log('📄 Document follower găsit:', { id: followerDoc.id, data: followerData });
            const followerId = followerData.followerId || followerDoc.id;
            console.log('👤 FollowerId rezolvat:', followerId);
            
            // Preia datele utilizatorului din colecția "users"
            const userRef = doc(db, "users", followerId);
            try {
                const userSnap = await getDoc(userRef);
                
                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    followers.push({
                        userId: followerId,
                        username: userData.username || userData.displayName || 'Utilizator Necunoscut',
                        profilePicture: userData.profilePicture || defaultAvatar,
                        followedAt: followerData.timestamp || null
                    });
                } else {
                    // Fallback pentru utilizatori șterși
                    followers.push({
                        userId: followerId,
                        username: 'Utilizator Necunoscut',
                        profilePicture: defaultAvatar,
                        followedAt: followerData.timestamp || null
                    });
                }
            } catch (error) {
                console.error(`Eroare la citirea datelor pentru follower ${followerId}:`, error);
                followers.push({
                    userId: followerId,
                    username: 'Utilizator Necunoscut',
                    profilePicture: defaultAvatar,
                    followedAt: followerData.timestamp || null
                });
            }
        }
        
        return followers;
    } catch (error) {
        console.error("Eroare la preluarea follower-ilor:", error);
        throw error;
    }
};

// Obține lista de utilizatori pe care îi urmărește un utilizator
export const getFollowing = async (userId) => {
    try {
        const followingRef = collection(db, "users", userId, "following");
        const q = query(followingRef, orderBy("timestamp", "desc"));
        
        const querySnapshot = await getDocs(q);
        const following = [];
        
        for (const followingDoc of querySnapshot.docs) {
            const followingData = followingDoc.data();
            const followedId = followingData.followedId || followingDoc.id;
            
            // Preia datele utilizatorului din colecția "users"
            const userRef = doc(db, "users", followedId);
            try {
                const userSnap = await getDoc(userRef);
                
                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    following.push({
                        userId: followedId,
                        username: userData.username || userData.displayName || 'Utilizator Necunoscut',
                        profilePicture: userData.profilePicture || defaultAvatar,
                        followedAt: followingData.timestamp || null
                    });
                } else {
                    // Fallback pentru utilizatori șterși
                    following.push({
                        userId: followedId,
                        username: 'Utilizator Necunoscut',
                        profilePicture: defaultAvatar,
                        followedAt: followingData.timestamp || null
                    });
                }
            } catch (error) {
                console.error(`Eroare la citirea datelor pentru following ${followedId}:`, error);
                following.push({
                    userId: followedId,
                    username: 'Utilizator Necunoscut',
                    profilePicture: defaultAvatar,
                    followedAt: followingData.timestamp || null
                });
            }
        }
        
        return following;
    } catch (error) {
        console.error("Eroare la preluarea following-ului:", error);
        throw error;
    }
};