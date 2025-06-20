import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // ✅ Rutas relativas para deploy sin errores

  // 🔧 Configuración del servidor de desarrollo
  server: {
    hmr: {
      protocol: 'ws',  // Usar WebSocket para hot reload
      host: 'localhost',
      port: 5173,
    },
  },

  // ✅ Solución para que jwt-decode funcione bien en Vite (es CommonJS)
  optimizeDeps: {
    include: ['jwt-decode'],
  },
});
