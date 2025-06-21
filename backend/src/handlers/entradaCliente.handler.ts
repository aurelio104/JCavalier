import { WASocket, proto } from '@whiskeysockets/baileys'
import { empresaConfig } from '../config/empresaConfig'
import { obtenerTasaBCV } from '@flows/payment.flow'
import { getUser, saveConversationToMongo } from '@memory/memory.mongo'

const removeAccents = (str: string): string =>
  str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()

export async function manejarEntradaInformativa({
  sock,
  msg,
  from,
  text,
  name
}: {
  sock: WASocket
  msg: proto.IWebMessageInfo
  from: string
  text: string
  name: string
}): Promise<boolean> {
  const normalized = removeAccents(text)

  // 🧭 Ubicación
  const keywordsUbicacion = [
    'ubicacion', 'ubicacion exacta', 'ubicados', 'direccion', 'direcion',
    'donde estan', 'donde estan ubicados', 'donde queda la tienda',
    'como llegar', 'mapa', 'punto de venta'
  ]
  if (keywordsUbicacion.some(k => normalized.includes(k))) {
    const { direccion, telefono, ubicacionURL } = empresaConfig.contacto
    await sock.sendMessage(from, {
      text: `📍 Dirección:\n${direccion}\n\n🔗 Mapa: ${ubicacionURL}\n📱 ${telefono}`
    })
    return true
  }

  // 💱 Tasa o bolívares
  const keywordsBss = [
    'bolivares', 'bs', 'bs.', 'bss', 'tasa', 'taza',
    'cuanto esta el dolar', 'cuanto esta el bcv', 'cual es la tasa',
    'cual es la taza', 'cual es la tasa hoy', 'cuanto esta hoy', 'precio del dolar'
  ]
  if (keywordsBss.some(k => normalized.includes(removeAccents(k)))) {
    const tasaBCV = await obtenerTasaBCV()
    const metodos = ['Pago Móvil', 'Transferencia Bancaria'].map(m => `✅ ${m}`).join('\n')
    const tasaTexto = tasaBCV > 0
      ? `📊 Tasa BCV: ${tasaBCV.toFixed(2)} Bs/USD`
      : `⚠️ No pude consultar la tasa oficial.`

    await sock.sendMessage(from, {
      text: `💳 Aceptamos bolívares:\n\n${metodos}\n\n${tasaTexto}`
    })
    return true
  }

  // 💳 Métodos de pago
  const preguntaDePago = /((metodos?|formas?) de pagos?|como (puedo )?pagar|aceptan|quiero pagar|puedo pagar con|cu[aá]les son los m[ée]todos? de pagos?)/i.test(normalized)
  if (preguntaDePago) {
    await sock.sendMessage(from, {
      text: `💳 Métodos de pago:\n\n✅ Pago Móvil (Bs)\n✅ Transferencia (Bs)\n✅ Zelle (USD)\n✅ Binance (USD)\n✅ Efectivo`
    })
    return true
  }

  // 🛍️ Ventas al mayor
  const keywordsMayor = [
    'al mayor', 'ventas al mayor', 'precio al mayor',
    'venden al mayor', 'es al mayor', 'comprar al mayor'
  ]
  if (keywordsMayor.some(k => normalized.includes(k))) {
    await sock.sendMessage(from, {
      text: `🛍️ ¡Claro que sí! También ofrecemos ventas al mayor. \
Si deseas más información, escribinos aquí y te brindamos todos los detalles.`
    })
    return true
  }

  // 🙏 Agradecimientos
  const keywordsGracias = ['gracias', 'muchas gracias', 'se agradece', 'gracias por la info']
  if (keywordsGracias.some(k => normalized === k)) {
    const user = await getUser(from)
    const ultimaVez = user?.ultimoThankYouShown ? new Date(user.ultimoThankYouShown).getTime() : 0
    const ahora = Date.now()

    if (ahora - ultimaVez > 2 * 60 * 1000) {
      await sock.sendMessage(from, {
        text: '¡Gracias a ti! Si necesitás algo más, estoy por aquí. 😊'
      })

      await saveConversationToMongo(from, {
        ...user,
        ultimoThankYouShown: new Date(),
        ultimaIntencion: 'thank_you'
      })
    }
    return true
  }

  return false
}
