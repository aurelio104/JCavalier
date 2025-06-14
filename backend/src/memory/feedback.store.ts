// ✅ src/intelligence/productResponder.ts

import { empresaConfig } from '../config/empresaConfig'; // Importamos la configuración de la empresa

export function generarRespuestaProducto(name: string, text: string): string | null {
  const lower = text.toLowerCase()

  // Detectamos si se menciona 'camisa' o 'camisas'
  if (lower.includes('camisa') || lower.includes('camisas')) {
    const collection = empresaConfig.colecciones['Sun Set']; // Obtenemos la colección desde la configuración de la empresa
    return `¡Hola ${name}! 👕 Veo que estás interesado en nuestras camisas.  
Actualmente tenemos colores clásicos como blanco, azul marino y negro,  
así como tonos vibrantes como rojo burdeos, verde esmeralda y más.

🌐 Podés ver toda la colección aquí: ${collection.link}

Si me contás qué estilo te gusta, te puedo ayudar a elegir 😉`
  }

  // Detectamos si se menciona 'pantalón' o 'pantalones'
  if (lower.includes('pantalon') || lower.includes('pantalones')) {
    const collection = empresaConfig.colecciones['Monarch linen']; // Obtenemos la colección de pantalones
    return `¡Hola ${name}! 👖 ¡Los pantalones JCAVALIER son un clásico!  
Contamos con tonos como negro, gris plomo, beige y oliva militar.

🌐 Podés verlos todos aquí: ${collection.link}

Decime si preferís un estilo más elegante, urbano o relajado 😎`
  }

  // Detectamos si se menciona 'franela' o 'franelas'
  if (lower.includes('franela') || lower.includes('franelas')) {
    const collection = empresaConfig.colecciones['Sun Set']; // Obtenemos la colección de franelas
    return `¡Hola ${name}! 🧥 Las franelas JCAVALIER combinan comodidad y actitud.  
Tenemos colores suaves como blanco hueso, rosado palo y celeste,  
y tonos intensos como negro, rojo vino y azul eléctrico.

🌐 Miralas acá: ${collection.link}

Si me contás qué te gusta, te muestro opciones 😉`
  }

  return null
}
