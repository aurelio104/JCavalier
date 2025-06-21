import { getUser } from '@memory/memory.mongo'
import { UserHistoryEntry } from '@schemas/UserMemory'
import { empresaConfig } from '../config/empresaConfig'
import { detectLanguage } from '../utils/lang'

/**
 * Genera el contexto detallado del usuario para respuestas más humanas.
 */
export async function buildUserContext(userId: string): Promise<string> {
  const user = await getUser(userId)
  if (!user) return 'No se encontró información del usuario.'

  const recentHistory = user.history
    .slice(-5)
    .map((h: UserHistoryEntry) => `• (${h.intent}) ${h.message}`)
    .join('\n') || 'Sin mensajes recientes.'

  const lastSeen = user.lastSeen
    ? new Date(user.lastSeen).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })
    : 'Desconocida'

  const tags = user.tags?.slice(-3).join(', ') || 'No definidos'
  const styles = user.preferredStyles?.join(', ') || 'No registradas'
  const lastMessage = user.lastMessage || ''
  const userLanguage = detectLanguage(lastMessage)

  return `
👤 Nombre: ${user.name}
💬 Último mensaje: "${user.lastMessage}"
🕒 Última conexión: ${lastSeen}
🧠 Resumen emocional: ${user.emotionSummary}

📦 Último producto visto: ${user.lastViewedProduct || 'No registrado'}
🛒 Último pedido: ${user.lastOrder || 'Sin pedidos aún'}
📍 Zona habitual: ${user.location || 'No especificada'}
🔁 Frecuencia de interacción: ${user.frequency || 'ocasional'}
📊 Nivel de compra: ${user.profileType || 'indefinido'}

🏷️ Temas recientes: ${tags}
🎨 Preferencias estilísticas: ${styles}

📚 Historial reciente:
${recentHistory}

🏢 Empresa: ${empresaConfig.nombre}
📍 Ubicación: ${empresaConfig.contacto.direccion}
📞 Contacto: ${empresaConfig.contacto.telefono} / ${empresaConfig.contacto.correo}

🌐 Idioma preferido: ${userLanguage === 'es' ? 'Español Latino' : 'Inglés'}
`.trim()
}
