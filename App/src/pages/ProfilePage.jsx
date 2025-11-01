// src/pages/ProfilePage.jsx (Fragment cheie)
import { query, where, getDocs } from 'firebase/firestore'; 
import { useAuth } from '../hooks/useAuth';

function ProfilePage() {
  const { currentUser } = useAuth();
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchUserPosts = async () => {
      // Filtrează postările: ia doar cele unde 'userId' este ID-ul userului curent
      const q = query(
        collection(db, 'posts'), 
        where('userId', '==', currentUser.uid),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      setUserPosts(
        querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
    };

    fetchUserPosts();
  }, [currentUser]);

  return (
    // ... afișează numele userului și lista de userPosts
  );
}
// ...