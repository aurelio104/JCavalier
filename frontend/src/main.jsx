import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Router para manejar la navegación
import App from './App.jsx';
import './index.css'; // Estilos globales

// Crear la raíz de la aplicación y renderizar el componente App
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>  {/* BrowserRouter proporciona la capacidad de manejar la navegación */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
