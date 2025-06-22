// src/main.jsx o src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// ✅ Importar el sistema de notificaciones
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Montar el sistema de notificaciones */}
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
