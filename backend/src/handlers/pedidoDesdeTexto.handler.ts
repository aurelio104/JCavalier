// ✅ src/handlers/pedidoDesdeTexto.handler.ts

import { WASocket, proto } from '@whiskeysockets/baileys'
import { contienePedidoDesdeWeb, parseOrderMessage } from '@intelligence/order.detector'
import { logUserInteraction, updateUser, getUser } from '@memory/memory.mongo'
import type { Pedido } from '@schemas/UserMemory'
import { v4 as uuidv4 } from 'uuid'

export async function manejarPedidoDesdeTexto({
  sock,
  text,
  name,
  from
}: {
  sock: WASocket
  text: string
  name: string
  from: string
}): Promise<boolean> {
  if (!contienePedidoDesdeWeb(text)) return false

  const resultado = parseOrderMessage(text)

  if (!resultado.esPedidoValido) {
    await sock.sendMessage(from, {
      text: resultado.mensajeAlCliente || '⚠️ No pude interpretar correctamente tu pedido. ¿Podés reenviarlo o escribirlo nuevamente, por favor? 🙏'
    })
    return true
  }

  const resumen = resultado.productos.map((p, i) =>
    `🛍️ Producto ${i + 1}:
•⁠ Colección: ${p.coleccion}
•⁠ Nombre: ${p.nombre}
•⁠ Talla: ${p.talla}
•⁠ Color: ${p.color}
•⁠ Precio: ${p.precio}`
  ).join('\n\n')

  const total = resultado.productos.reduce((sum, p) => sum + parseFloat(p.precio), 0)

  const nuevoPedido: Pedido = {
    id: uuidv4(),
    fecha: Date.now(),
    productos: resultado.productos.map(p => p.nombre),
    total: total.toFixed(2),
    metodoPago: '',
    estado: 'pendiente',
    pdfGenerado: false
  }

  const userMemory = await getUser(from)

  await updateUser(from, {
    name,
    pedidos: [...(userMemory?.pedidos || []), nuevoPedido],
    ultimaIntencion: 'order',
    fechaUltimaCompra: Date.now()
  })

  await sock.sendMessage(from, {
    text: `✨ Perfecto ${name}, ya tengo tu pedido registrado. Aquí está el resumen completo:\n\n${resumen}\n\n💰 *Total a pagar: $${total.toFixed(2)}*`
  })

  setTimeout(() => {
    void sock.sendMessage(from, {
      text: `¿Cómo prefieres realizar el pago?\n\n1️⃣ *Pago móvil*\n2️⃣ *Transferencia bancaria*\n3️⃣ *Zelle*\n4️⃣ *Binance*\n5️⃣ *Efectivo* (al recibir el producto)`
    })
  }, 1200)

  await logUserInteraction(from, text, 'positive', 'order', name)
  return true
}
