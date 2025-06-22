import express from 'express'
import { getAllUsers } from '@memory/memory.mongo'
import { UserMemoryWithId, Pedido } from '@schemas/UserMemory'

const router = express.Router()

// 🧭 Redirección limpia: /api/seguimiento/:id → /seguimiento/:id
router.get('/api/seguimiento/:id', (req, res) => {
  const { id } = req.params
  return res.redirect(`/seguimiento/${id}`)
})

// 📦 Vista bonita: /seguimiento/:id
router.get('/seguimiento/:id', async (req, res) => {
  const { id } = req.params

  if (!/^[a-zA-Z0-9-_]{4,30}$/.test(id)) {
    return res.status(400).send('ID inválido')
  }

  try {
    const users: UserMemoryWithId[] = await getAllUsers()

    const userWithPedido = users.find(u => u.pedidos?.some(p => p.id === id))
    if (!userWithPedido) return res.status(404).send('Pedido no encontrado')

    const pedidoOriginal = userWithPedido.pedidos?.find(p => p.id === id)
    if (!pedidoOriginal) return res.status(404).send('Pedido no encontrado')

    const pedido: Pedido & {
      nombreCliente?: string
      telefonoCliente?: string
    } = {
      ...pedidoOriginal,
      nombreCliente: pedidoOriginal.nombreCliente || userWithPedido.name || 'Cliente',
      telefonoCliente: pedidoOriginal.telefonoCliente || userWithPedido.telefono || '---'
    }

    const isHtmlRequest = req.headers.accept?.includes('text/html')

    if (isHtmlRequest) {
      return res.render('seguimiento', { pedido })
    }

    // Respuesta JSON
    return res.json({
      id: pedido.id,
      estado: pedido.estado,
      totalUSD: pedido.total,
      totalBs: pedido.totalBs,
      fecha: pedido.fecha,
      productos: pedido.productos,
      metodoPago: pedido.metodoPago,
      datosEntrega: pedido.datosEntrega,
      nombreCliente: pedido.nombreCliente,
      telefonoCliente: pedido.telefonoCliente
    })
  } catch (err) {
    console.error('❌ Error en seguimiento:', err)
    return res.status(500).send('Error interno del servidor')
  }
})

export default router
