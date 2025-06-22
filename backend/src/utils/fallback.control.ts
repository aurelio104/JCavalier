// src/utils/fallback.control.ts

import { UserMemory } from '@schemas/UserMemory'

/**
 * 🔄 Determina si se debe activar el fallback inteligente
 * Basado en la última intención manejada y estado del pedido
 */
export function shouldTriggerFallback(user: UserMemory | null): boolean {
  if (!user) return true // Si no hay datos, puede que sea nuevo o no identificado

  const now = Date.now()
  const ultimoIntento = user.ultimoIntentHandled?.timestamp || 0
  const tienePedidoActivo = !!user.estadoPedido

  // Solo dispara fallback si han pasado más de 15s desde la última intención reconocida
  // y no hay un pedido activo en curso
  return now - ultimoIntento > 15000 && !tienePedidoActivo
}
