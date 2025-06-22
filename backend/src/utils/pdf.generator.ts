import { UserMemory, Pedido } from '@schemas/UserMemory'
import PDFDocument from 'pdfkit'
import { PassThrough } from 'stream'
import QRCode from 'qrcode'
import path from 'path'

export async function generarPDFPedido(user: UserMemory, pedido: Pedido): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 50 })
  const passthroughStream = new PassThrough()
  doc.pipe(passthroughStream)

  const chunks: Buffer[] = []
  passthroughStream.on('data', (chunk) => chunks.push(chunk))

  const bufferPromise = new Promise<Buffer>((resolve) => {
    passthroughStream.on('end', () => resolve(Buffer.concat(chunks)))
  })

  // 🖼️ Logo
  try {
    const logoPath = path.join(__dirname, '../assets/logo-jcavalier.png')
    doc.image(logoPath, { fit: [100, 100], align: 'center' })
  } catch (e) {
    doc.text('📄 JCAVALIER', { align: 'center' })
  }
  doc.moveDown()

  // 📄 Título
  doc.fontSize(20).fillColor('black').text('📄 Confirmación de Pedido', { align: 'center' })
  doc.moveDown(2)

  // 🧾 Datos del cliente
  doc.fontSize(14).fillColor('black')
  doc.text(`🧾 Cliente: ${user.name || 'No especificado'}`)
  doc.text(`📞 Teléfono: ${user.telefono || 'No especificado'}`)
  doc.text(`🆔 ID del pedido: ${pedido.id || 'N/A'}`)
  doc.text(`🕒 Fecha: ${new Date(pedido.fecha).toLocaleString()}`)

  // 💰 Información del pago
  doc.moveDown()
  doc.text(`💰 Total en USD: $${pedido.total || '0.00'}`)
  doc.text(`💳 Método de pago: ${pedido.metodoPago || 'No definido'}`)
  doc.text(`📦 Estado del pedido: ${pedido.estado || 'pendiente'}`)

  if (pedido.tasaBCV && pedido.totalBs) {
    doc.text(`💱 Tasa BCV usada: ${pedido.tasaBCV} Bs/USD`)
    doc.text(`💵 Total en Bs: Bs.S ${pedido.totalBs}`)
  }

  // 📬 Datos de entrega
  if (pedido.datosEntrega) {
    doc.moveDown()
    doc.text(`📬 Dirección / Datos de entrega:`)
    doc.text(pedido.datosEntrega)
  }

  // 🔢 Código de seguimiento
  if (pedido.codigoSeguimiento) {
    doc.moveDown()
    doc.text(`🔢 Código de seguimiento: ${pedido.codigoSeguimiento}`)
  }

  // 🛍️ Lista de productos
  if (pedido.productos?.length) {
    doc.moveDown()
    doc.moveTo(doc.page.margins.left, doc.y)
       .lineTo(doc.page.width - doc.page.margins.right, doc.y)
       .strokeColor('#cccccc')
       .stroke()
    doc.moveDown()
    doc.text(`🛍️ Productos:`)
    pedido.productos.forEach((prod, i) => {
      doc.text(`${i + 1}. ${prod}`)
    })
  }

  // 🙏 Agradecimiento final
  doc.moveDown()
  doc.text('🙏 Gracias por tu compra. Estamos a tu disposición para cualquier duda o cambio.')

  // 📲 Código QR con seguimiento
  if (pedido.id) {
    try {
      const qrData = `https://jcavalier.com/seguimiento/${pedido.id}`
      const qrImage = await QRCode.toDataURL(qrData)
      const qrBuffer = Buffer.from(qrImage.split(',')[1], 'base64')
      doc.addPage()
      doc.image(qrBuffer, {
        fit: [200, 200],
        align: 'center',
        valign: 'center'
      })
      doc.moveDown()
      doc.fontSize(12).text('Escanea este código para ver el estado de tu pedido.', { align: 'center' })
      doc.text(qrData, { align: 'center', link: qrData, underline: true })
    } catch (err) {
      doc.moveDown()
      doc.fontSize(12).fillColor('red').text('⚠️ Error generando código QR.', { align: 'center' })
    }
  }

  // ✍️ Firma de marca
  doc.moveDown(2)
  doc.fontSize(10).fillColor('gray').text('— JCAVALIER — Estilo con propósito', {
    align: 'center'
  })

  doc.end()
  return bufferPromise
}
