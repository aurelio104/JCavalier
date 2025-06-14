// ✅ src/intelligence/context.generator.ts

import { getUser } from '@memory/memory.mongo';
import { UserMemory, UserHistoryEntry } from '@schemas/UserMemory';
import { empresaConfig } from '../config/empresaConfig';
import { detectLanguage } from '../utils/lang'; // Importamos la función para detectar el idioma

/**
 * Genera el contexto del usuario, incluyendo su historial y preferencias
 */
export async function buildUserContext(userId: string): Promise<string> {
  const user = await getUser(userId);

  if (!user) return 'No se encontró información del usuario.';

  // Construcción del historial reciente
  const recentHistory = user.history
    .slice(-5)
    .map((h: UserHistoryEntry) => `• (${h.intent}) ${h.message}`)
    .join('\n') || 'Sin mensajes recientes.';

  // Formateo de la última conexión
  const lastSeen = user.lastSeen
    ? new Date(user.lastSeen).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })
    : 'Desconocida';

  // Recopilación de etiquetas y preferencias estilísticas
  const tags = user.tags?.slice(-3).join(', ') || 'No definidos';
  const styles = user.preferredStyles?.join(', ') || 'No registradas';

  // Detectar el idioma de la última interacción del usuario para manejar la conversación correctamente
  const lastMessage = user.lastMessage || '';
  const userLanguage = detectLanguage(lastMessage); // Detecta el idioma del último mensaje

  // Generación del contexto completo del usuario, con información de la empresa y preferencias de idioma
  return `
👤 Nombre: ${user.name}
💬 Último mensaje: "${user.lastMessage}"
🕒 Última conexión: ${lastSeen}
🧠 Resumen emocional: ${user.emotionSummary}
🏷️ Temas recientes: ${tags}
🎨 Preferencias estilísticas: ${styles}

📚 Historial reciente:
${recentHistory}

🏢 Empresa: ${empresaConfig.nombre}
📍 Ubicación: ${empresaConfig.contacto.direccion}
📞 Contacto: ${empresaConfig.contacto.telefono} / ${empresaConfig.contacto.correo}

🌐 Idioma preferido: ${userLanguage === 'es' ? 'Español Latino' : 'Inglés'}

`.trim(); // Retorna el contexto completo
}
