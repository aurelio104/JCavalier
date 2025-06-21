import { UserMemory } from '@schemas/UserMemory'
import fs from 'fs/promises'
import path from 'path'
import PDFDocument from 'pdfkit'
import os from 'os'

export async function generarPDFPedido(user: UserMemory): Promise<string> {
  const doc = new PDFDocument()

  const tempDir = process.env.NODE_ENV === 'production'
    ? os.tmpdir()
    : path.join(__dirname, '../../temp')

  const fileName = `Pedido_${user._id || 'cliente'}.pdf`
  const filePath = path.join(tempDir, fileName)

  const writeStream = await fs.open(filePath, 'w')
  doc.pipe(writeStream.createWriteStream())

  doc.fontSize(20).text('📄 Confirmación de Pedido', { align: 'center' })
  doc.moveDown()

  doc.fontSize(14).text(`🧾 Cliente: ${user.name}`)
  doc.text(`🆔 ID: ${user._id || 'N/A'}`)
  doc.text(`🕒 Fecha: ${new Date().toLocaleString()}`)
  doc.text(`💰 Total: $${user.total || '0.00'}`)
  doc.text(`💳 Método de pago: ${user.metodoPago || 'No definido'}`)
  doc.text(`📦 Estado del pedido: ${user.estadoPedido || 'pendiente'}`)

  if (user.datosEntrega) {
    doc.moveDown()
    doc.text(`📬 Datos de entrega:`)
    doc.text(user.datosEntrega)
  }

  if (user.productos?.length) {
    doc.moveDown()
    doc.text(`🛍️ Productos:`)
    user.productos.forEach((prod, i) => {
      doc.text(`${i + 1}. ${prod}`)
    })
  }

  doc.end()
  await new Promise(resolve => doc.on('finish', resolve))

  return filePath
}