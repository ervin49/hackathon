import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Componente de Layout și Protecție
import Header from './components/Layout/Header.jsx';
import PrivateRoute from './components/Layout/PrivateRoute.jsx'; 
// Importă Paginile
import LoginPage from './pages/LoginPage.jsx';
import FeedPage from './pages/FeedPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

function App() {
  return (
    <>
      <Header /> {/* 👈 Header-ul este mereu randat */}
      <div className="min-h-screen bg-gray-100 pt-16"> {/* Asigurăm un fundal și spațiu pentru header */}
        <Routes>
          {/* Ruta de Login este accesibilă tuturor */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rutele protejate folosesc PrivateRoute */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<FeedPage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
          </Route>
          
          {/* Opțional: Ruta 404 (pentru orice altceva) */}
          <Route path="*" element={<p className="text-center mt-20 text-xl">404 | Pagina nu a fost găsită.</p>} />
        </Routes>
      </div>
    </>
  );
}

export default App;