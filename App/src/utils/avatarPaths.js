// src/utils/avatarPaths.js

// 🚨 ATENȚIE: Verifică dacă aceste căi se potrivesc cu structura ta de foldere!
// Presupunem ca imaginile sunt in src/assets/avatars/
import avatar1 from '../assets/avatars/avatar1.png';
import avatar2 from '../assets/avatars/avatar2.png';
import avatar3 from '../assets/avatars/avatar3.png';
import avatar4 from '../assets/avatars/avatar4.png';
import avatar5 from '../assets/avatars/avatar5.png';
import avatar6 from '../assets/avatars/avatar6.png';
import avatar7 from '../assets/avatars/avatar7.png';
import avatar8 from '../assets/avatars/avatar8.png';
import defaultAvatar from '../assets/avatars/default-avatar.png'; // 🛑 CORECTIE CALE

// Lista de avatare pe care utilizatorii le pot alege
const AVAILABLE_AVATARS = [
    avatar1,
    avatar2,
    avatar3,
    avatar4,
    avatar5,
    avatar6,
    avatar7,
    avatar8,
    // Poți adăuga aici oricâte imagini locale mai ai (avatar4, avatar5, etc.)
];

export { AVAILABLE_AVATARS, defaultAvatar };