import axios from 'axios';
import jwt_decode from 'jwt-decode';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// 🔐 Función para iniciar sesión
export const login = async (email, password) => {
  try {
    console.log('📨 Enviando credenciales:', { email, password });

    const response = await axios.post(`${API_URL}/login`, { email, password });

    if (response.status === 200 && response.data.token) {
      localStorage.setItem('token', response.data.token);
      console.log('✅ Token recibido y almacenado');
      return true;
    }

    console.warn('⚠️ Respuesta inesperada del backend:', response.data);
    return false;
  } catch (error) {
    if (axios.isAxiosError?.(error) && error.response) {
      console.error('❌ Error del backend:', error.response.data?.error || error.response.data);
    } else {
      console.error('❌ Error de red o conexión:', error.message);
    }
    return false;
  }
};

// 🔍 Verifica si el usuario está autenticado
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('🔒 No hay token en localStorage');
    return false;
  }

  try {
    const decoded = jwt_decode(token);
    console.log('🔓 Token decodificado:', decoded);

    if (decoded.exp * 1000 < Date.now()) {
      console.log('⌛ Token expirado');
      localStorage.removeItem('token');
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Token inválido:', error);
    return false;
  }
};

// 🔚 Logout
export const logout = () => {
  localStorage.removeItem('token');
  console.log('👋 Usuario deslogueado');
};
