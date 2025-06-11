import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth'; // Usamos el método de auth.js para verificar la autenticación

const PrivateRoute = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    // Verificar la autenticación al montar el componente
    const checkAuth = async () => {
      const authStatus = await isAuthenticated();
      setAuthenticated(authStatus);
    };

    checkAuth(); // Comprobar el estado de la autenticación cuando se monte el componente
  }, []);

  if (authenticated === null) {
    // Si no sabemos si el usuario está autenticado (estado inicial), podemos mostrar un cargando o similar
    return <div>Loading...</div>;
  }

  // Si el usuario no está autenticado, redirigimos al login
  if (!authenticated) {
    return <Navigate to="/admin" replace />;
  }

  // Si el usuario está autenticado, renderizamos el componente protegido
  return children;
};

export default PrivateRoute;
