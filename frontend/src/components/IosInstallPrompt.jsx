import React, { useEffect, useState } from 'react';

const isIos = () =>
  /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());

const isInStandaloneMode = () =>
  'standalone' in window.navigator && window.navigator.standalone;

/**
 * Componente que muestra un aviso de instalación en dispositivos iOS
 * cuando no está instalada como PWA.
 */
const IosInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (isIos() && !isInStandaloneMode()) {
      setShowPrompt(true);
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 md:left-8 md:right-auto md:w-auto p-4 bg-white text-black rounded-xl shadow-xl z-50 border border-gray-300 text-center text-sm md:text-base animate-fadeIn"
    >
      📲 Para instalar esta app en tu iPhone:
      <br />
      Toca el ícono <strong>Compartir</strong> y selecciona{" "}
      <strong>"Agregar a pantalla de inicio"</strong>.
    </div>
  );
};

export default IosInstallPrompt;
