// src/handlers/preguntaInformativa.handler.ts

import { obtenerTasaBCV } from '@flows/payment.flow'
import { detectarMoneda } from '@utils/moneda'
import { empresaConfig } from '../config/empresaConfig'
import { WASocket } from '@whiskeysockets/baileys'

export async function manejarPreguntaInformativa({
  sock,
  from,
  name,
  text
}: {
  sock: WASocket
  from: string
  name: string
  text: string
}): Promise<boolean> {
  const normalized = text.normalize('NFD').replace(/[\p{Diacritic}]/gu, '').toLowerCase()

  const preguntaInformativa = /\b(aceptan bol[ií]vares?|tasa|taza|horario|ubicaci[oó]n|d[oó]nde est[aá]n|direcci[oó]n|d[oó]lares?)\b/.test(normalized)
  if (!preguntaInformativa) return false

  const moneda = detectarMoneda(normalized)

  if (moneda === 'VES') {
    const tasaBCV = await obtenerTasaBCV()
    const metodos = ['Pago Movil', 'Transferencia Bancaria'].map(m => `✅ ${m}`).join('\n')
    const tasaTexto = tasaBCV > 0
      ? `📊 Tasa oficial BCV actual: ${tasaBCV.toFixed(2)} Bs/USD`
      : `⚠️ No se pudo obtener la tasa oficial BCV.`

    await sock.sendMessage(from, {
      text: `💳 Aceptamos estos métodos de pago en bolívares:\n\n${metodos}\n\n${tasaTexto}`
    })
    return true
  }

  if (normalized.includes('ubicacion') || normalized.includes('direccion') || normalized.includes('donde estan')) {
    const { direccion, telefono, correo, ubicacionURL } = empresaConfig.contacto
    await sock.sendMessage(from, {
      text: `🏠 ¡Hola, ${name}! Aquí está la dirección de nuestra tienda:\n\n📍 *Dirección:* ${direccion}\n🔗 Google Maps: ${ubicacionURL}\n📱 Teléfono: ${telefono}\n✉️ Correo: ${correo}`
    })
    return true
  }

  if (normalized.includes('horario')) {
    await sock.sendMessage(from, {
      text: `🕒 Nuestro horario de atención es:\n\n🗓️ Lunes a Viernes: 8:00 a.m. a 6:00 p.m.\n🕛 Sábados: hasta mediodía.`
    })
    return true
  }

  await sock.sendMessage(from, {
    text: `¡Claro ${name}! ¿En qué más puedo ayudarte? 😊`
  })

  return true
}
