import { getUser } from '@memory/memory.mongo';
import { UserHistoryEntry } from '@schemas/UserMemory';
import { empresaConfig } from '../config/empresaConfig';
import { detectLanguage } from '../utils/lang';

/**
 * Genera el contexto detallado del usuario para respuestas más humanas.
 */
export async function buildUserContext(userId: string): Promise<string> {
  const user = await getUser(userId);

  if (!user) return 'No se encontró información del usuario.';

  // Historial de interacciones recientes
  const recentHistory = user.history
    .slice(-5)
    .map((h: UserHistoryEntry) => `• (${h.intent}) ${h.message}`)
    .join('\n') || 'Sin mensajes recientes.';

  // Última conexión formateada
  const lastSeen = user.lastSeen
    ? new Date(user.lastSeen).toLocaleString('es-VE', {
        dateStyle: 'short',
        timeStyle: 'short'
      })
    : 'Desconocida';

  // Tags e intereses
  const tags = user.tags?.slice(-3).join(', ') || 'No definidos';
  const styles = user.preferredStyles?.join(', ') || 'No registradas';

  // Idioma detectado por último mensaje
  const lastMessage = user.lastMessage || '';
  const userLanguage = detectLanguage(lastMessage);

  // NUEVOS CAMPOS AVANZADOS
  const lastViewed = user.lastViewedProduct || 'No registrado';
  const lastOrder = user.lastOrder || 'Sin pedidos aún';
  const location = user.location || 'No especificada';
  const frequency = user.frequency || 'ocasional';
  const profileType = user.profileType || 'indefinido';

  // FUTUROS CAMPOS (dejar comentado si luego agregás más features)
  // const device = user.deviceType || 'Desconocido';
  // const preferredPayment = user.paymentPreference || 'No definido';

  return `
👤 Nombre: ${user.name}
💬 Último mensaje: "${user.lastMessage}"
🕒 Última conexión: ${lastSeen}
🧠 Resumen emocional: ${user.emotionSummary}

📦 Último producto visto: ${lastViewed}
🛒 Último pedido: ${lastOrder}
📍 Zona habitual: ${location}
🔁 Frecuencia de interacción: ${frequency}
📊 Nivel de compra: ${profileType}

🏷️ Temas recientes: ${tags}
🎨 Preferencias estilísticas: ${styles}

📚 Historial reciente:
${recentHistory}

🏢 Empresa: ${empresaConfig.nombre}
📍 Ubicación: ${empresaConfig.contacto.direccion}
📞 Contacto: ${empresaConfig.contacto.telefono} / ${empresaConfig.contacto.correo}

🌐 Idioma preferido: ${userLanguage === 'es' ? 'Español Latino' : 'Inglés'}
`.trim();
}
