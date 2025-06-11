import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Clave para rutas relativas

  // Configuración del servidor
  server: {
    hmr: {
      protocol: 'ws',  // Usar WebSocket
      host: 'localhost',  // Asegurarte de que el host esté configurado correctamente
      port: 5173, // Puerto por defecto de Vite
    },
  },
});
