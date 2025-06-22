import express from 'express'
import { getAllUsers, updateUser } from '@memory/memory.mongo'
import { UserMemoryWithId } from '@schemas/UserMemory'
import { sendEstadoUpdateToCliente } from '@utils/sendMessage'

const router = express.Router()

// ✅ GET /api/pedidos - Lista todos los pedidos agrupados por usuario
router.get('/admin/pedidos', async (_req, res) => {
  try {
    const users: UserMemoryWithId[] | null = await getAllUsers()

    if (!users) {
      return res.status(500).json({ error: 'No se pudo acceder a la base de datos' })
    }

    const pedidos = users.flatMap((user) =>
      (user.pedidos || []).map((pedido) => ({
        id: pedido.id,
        estado: pedido.estado,
        total: pedido.total,
        fecha: pedido.fecha,
        cliente: user.name,
        telefono: user.telefono,
        metodoPago: pedido.metodoPago,
        productos: pedido.productos,
        datosEntrega: pedido.datosEntrega,
        qrUrl: pedido.qrUrl
      }))
    )

    res.json(pedidos)
  } catch (err) {
    console.error('[GET /admin/pedidos] Error:', err)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// ✅ PUT /api/pedidos/:id - Actualiza el estado de un pedido y notifica por WhatsApp
router.put('/admin/pedidos/:id', async (req, res) => {
  const { id } = req.params
  const { nuevoEstado } = req.body

  if (!id || !nuevoEstado) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' })
  }

  try {
    const users: UserMemoryWithId[] | null = await getAllUsers()
    const user = users?.find((u) => u.pedidos?.some((p) => p.id === id))

    if (!user) {
      return res.status(404).json({ error: 'Pedido no encontrado' })
    }

    const index = user.pedidos!.findIndex((p) => p.id === id)
    if (index === -1) {
      return res.status(404).json({ error: 'Pedido no encontrado en usuario' })
    }

    // ✅ Actualizar el estado y guardar
    const pedido = user.pedidos![index]
    const estadoAnterior = pedido.estado
    pedido.estado = nuevoEstado

    console.log(`📝 Pedido antes: ${estadoAnterior} → después: ${nuevoEstado}`)

    await updateUser(user._id, { pedidos: user.pedidos })

    // ✅ Validar datos antes de notificar por WhatsApp
    const telefono = user.telefono?.trim()
    const nombre = user.name?.trim()

    if (telefono && nombre) {
      await sendEstadoUpdateToCliente(telefono, nombre, nuevoEstado)
      console.log(`📲 Mensaje enviado a ${telefono} con estado "${nuevoEstado}"`)
    } else {
      console.warn(`[!] Estado actualizado pero no se notificó por WhatsApp (falta nombre o teléfono en ${user._id})`)
    }

    res.json({ message: 'Estado actualizado correctamente' })
  } catch (err) {
    console.error('[PUT /admin/pedidos/:id] Error:', err)
    res.status(500).json({ error: 'Error actualizando el pedido' })
  }
})

export default router
