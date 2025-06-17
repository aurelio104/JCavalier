import { empresaConfig } from '../config/empresaConfig';
import { UserMemory } from '@schemas/UserMemory';

export function generarRespuestaProducto(name: string, text: string, user?: UserMemory): string | null {
  const lower = text.toLowerCase();

  // Respuesta empática si hubo frustración
  if (user?.emotionSummary === 'negative') {
    return `¡Hola ${name}! 🖤 Lamento si tuviste una mala experiencia antes. Estoy aquí para ayudarte a elegir lo mejor.`;
  }

  // Mensaje personalizado si es frecuente
  const saludoFrecuente = user?.frequency === 'recurrente'
    ? `¡Hola ${name}! 😊 Como siempre, un gusto ayudarte.`
    : `¡Hola ${name}! 😊`;

  // Detectamos si se menciona 'camisa' o 'camisas'
  if (lower.includes('camisa') || lower.includes('camisas')) {
    const collection = empresaConfig.colecciones['Sun Set'];
    return `${saludoFrecuente} 👕 Veo que estás interesado en nuestras camisas.  
Actualmente tenemos colores clásicos como blanco, azul marino y negro,  
así como tonos vibrantes como rojo burdeos, verde esmeralda y más.

🌐 Podés ver toda la colección aquí: ${collection.link}

Si me contás qué estilo te gusta, te puedo ayudar a elegir 😉`;
  }

  // Detectamos si se menciona 'pantalón' o 'pantalones'
  if (lower.includes('pantalon') || lower.includes('pantalones')) {
    const collection = empresaConfig.colecciones['Monarch linen'];
    return `${saludoFrecuente} 👖 ¡Los pantalones JCAVALIER son un clásico!  
Contamos con tonos como negro, gris plomo, beige y oliva militar.

🌐 Podés verlos todos aquí: ${collection.link}

Decime si preferís un estilo más elegante, urbano o relajado 😎`;
  }

  // Detectamos si se menciona 'franela' o 'franelas'
  if (lower.includes('franela') || lower.includes('franelas')) {
    const collection = empresaConfig.colecciones['Sun Set'];
    return `${saludoFrecuente} 🧥 Las franelas JCAVALIER combinan comodidad y actitud.  
Tenemos colores suaves como blanco hueso, rosado palo y celeste,  
y tonos intensos como negro, rojo vino y azul eléctrico.

🌐 Miralas acá: ${collection.link}

Si me contás qué te gusta, te muestro opciones 😉`;
  }

  return null;
}