import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const PrivateRoute = ({ children }) => {
  // Verificamos de inmediato si el usuario está autenticado
  const authenticated = isAuthenticated();

  // Si no está autenticado, redirigir al login
  if (!authenticated) {
    return <Navigate to="/admin" replace />;
  }

  // Si está autenticado, mostrar el contenido protegido
  return children;
};

export default PrivateRoute;
