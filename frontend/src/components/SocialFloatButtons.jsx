import React from 'react';
import { FaWhatsapp, FaInstagram, FaTiktok } from 'react-icons/fa';

const SocialFloatButtons = () => {
  return (
<div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
  <a
    href="https://wa.me/584128966414"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="WhatsApp"
    className="bg-black/80 text-white rounded-full p-2 hover:scale-105 transition-transform shadow"
  >
    <FaWhatsapp size={18} />
  </a>

  <a
    href="https://instagram.com/jcavalier_"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Instagram"
    className="bg-black/80 text-white rounded-full p-2 hover:scale-105 transition-transform shadow"
  >
    <FaInstagram size={18} />
  </a>

  <a
    href="https://tiktok.com/@jcavalier_"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="TikTok"
    className="bg-black/80 text-white rounded-full p-2 hover:scale-105 transition-transform shadow"
  >
    <FaTiktok size={18} />
  </a>
</div>
  );
};

export default SocialFloatButtons;
