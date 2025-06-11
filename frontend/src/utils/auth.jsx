import axios from 'axios';
// Importación correcta para entornos ESM sin default export
import * as jwt_decode from 'jwt-decode'; // Usamos 'import * as' para acceder a los exports

const API_URL = 'http://localhost:5000/api'; // Asegúrate de que esta URL sea correcta

// Función para realizar el login
export const login = async (email, password) => {
  try {
    console.log("Iniciando sesión con Email:", email);  // Verifica el email que se está enviando
    console.log("Contraseña:", password);  // Verifica la contraseña que se está enviando

    // Hacer la solicitud al backend para iniciar sesión
    const response = await axios.post(`${API_URL}/login`, { email, password });
    
    // Verificar si la respuesta es exitosa
    if (response.status === 200 && response.data.token) {
      const { token } = response.data;
      localStorage.setItem('token', token); // Guardar el token en localStorage
      console.log('Inicio de sesión exitoso, token recibido');
      return true;
    } else {
      console.error('Error en el servidor:', response.data.error || response.data);
      return false;
    }
  } catch (error) {
    if (error.response) {
      console.error('Error al iniciar sesión:', error.response.data); // Detalles del error del backend
    } else {
      console.error('Error de conexión:', error.message); // Error de conexión o de red
    }
    return false; // En caso de error, retornamos false
  }
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('No hay token, usuario no autenticado');
    return false; // Si no hay token, el usuario no está autenticado
  }

  // Verificar si el token está expirado o no es válido
  try {
    const decoded = jwt_decode(token); // Decodificar el token para obtener su payload
    console.log('Token decodificado:', decoded); // Verifica la información del token
    
    // Verificar si el token tiene un payload válido y si ha expirado
    if (decoded.exp * 1000 < Date.now()) {
      console.log('El token ha expirado');
      localStorage.removeItem('token');
      return false;
    }

    // Si el token es válido y no ha expirado, devolver true
    return true;
  } catch (e) {
    console.error('Token no válido:', e);
    return false; // Si el token no se puede decodificar, retornamos false
  }
};

// Función para hacer logout y eliminar el token de localStorage
export const logout = () => {
  localStorage.removeItem('token');
  console.log('Usuario deslogueado');
};
