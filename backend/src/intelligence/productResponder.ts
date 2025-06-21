// ✅ src/intelligence/product.response.ts

import { empresaConfig } from '../config/empresaConfig';
import { UserMemory } from '@schemas/UserMemory';

export function generarRespuestaProducto(name: string, text: string, user?: UserMemory): string | null {
  const lower = text.toLowerCase();

  const saludo = user?.frequency === 'recurrente'
    ? `Hola ${name}, ¡qué bueno tenerte otra vez! 👋`
    : `Hola ${name} 👋`;

  if (user?.emotionSummary === 'negative') {
    return `Hola ${name}. 🖤 Si algo no fue como esperabas, estoy aquí para ayudarte.`;
  }

  const responder = (mensaje: string, key: keyof typeof empresaConfig.colecciones) =>
    `${saludo} ${mensaje}\n👉 ${empresaConfig.colecciones[key].link}`;

  if (/camisa|manga corta|manga larga/.test(lower)) {
    return responder('Camisas sobrias y frescas para toda ocasión.', 'Monarch linen');
  }

  if (/pantalon|pantalones|jeans/.test(lower)) {
    return responder('Pantalones cómodos y con estilo urbano.', 'Set Diamond estilo old money');
  }

  if (/franela|playera|t-shirt/.test(lower)) {
    return responder('Franelas suaves con corte actual.', 'Franela Imperial estilo Old money');
  }

  if (/conjunto.*dama/.test(lower)) {
    return responder('Conjuntos deportivos para dama, cómodos y con estilo.', 'Gold Sport Set Dama');
  }

  if (/conjunto.*caballero/.test(lower)) {
    return responder('Conjuntos deportivos para caballero, prácticos y frescos.', 'Gold Sport Set Caballero');
  }

  if (/short|bermuda/.test(lower)) {
    return responder('Shorts ideales para días cálidos.', 'Set Diamond estilo old money');
  }

  if (/chemise/.test(lower)) {
    return responder('Chemises elegantes con tela tejida suave.', 'Chemise Imperial estilo Old money');
  }

  if (/ropa de playa|outfit de playa|sun set/.test(lower)) {
    return responder('Looks tropicales y relajados perfectos para clima playero.', 'Sun Set');
  }

  if (/cubana/.test(lower)) {
    return responder('Camisas cubanas con aire tropical y corte relajado.', 'Camisas Cubanas');
  }

  if (/oversize|gladiador/.test(lower)) {
    return responder('Merch oversize con actitud y diseño bold.', 'Merch Oversize Gladiador');
  }

  return null;
}
