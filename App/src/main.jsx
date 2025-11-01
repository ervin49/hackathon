import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';
import './index.css'; // Asigură-te că aici este importat CSS-ul (inclusiv Tailwind)

// Importă Contextul de Autentificare
import { AuthProvider } from './context/AuthContext.jsx'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BrowserRouter permite navigarea între pagini */}
    <BrowserRouter>
      {/* 🌟 AuthProvider oferă starea de autentificare întregii aplicații 🌟 */}
      <AuthProvider> 
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);