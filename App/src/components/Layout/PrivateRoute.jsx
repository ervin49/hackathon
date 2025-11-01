import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../UI/Spinner.jsx'; 

const PrivateRoute = () => {
  const { currentUser, loading } = useAuth();

  // 1. Așteaptă finalizarea verificării Firebase.
  // Dacă loading este TRUE, afișează un Spinner (rezolvă ecranul gri gol).
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen flex-col bg-gray-100">
        <Spinner /> 
        <p className="mt-4 text-lg text-gray-600">Verificarea sesiunii...</p>
      </div>
    );
  }

  // 2. Dacă utilizatorul este logat, randează conținutul paginii.
  if (currentUser) {
    return <Outlet />;
  }

  // 3. Altfel (nu este logat și nu mai așteptăm), redirecționează către pagina de login.
  return <Navigate to="/login" />;
};

export default PrivateRoute;