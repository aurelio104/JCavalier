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
  const normalized = text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()

  // 🧠 Categorías informativas
  const expresiones = {
    bolivares: [
      'aceptan bolivares', 'puedo pagar en bs', 'puedo pagar en bolivares',
      'se puede pagar en bs', 'pago en bolivares', 'bolivares', 'bs', 'bs.s'
    ],
    metodosPago: [
      'metodos de pago', 'formas de pago', 'como puedo pagar', 'como se paga',
      'formas para pagar', 'opciones de pago', 'formas disponibles de pago',
      'que opciones de pago tienen', 'que metodos de pago aceptan',
      'cuales son los metodos de pago', 'aceptan zelle', 'aceptan pago movil',
      'aceptan transferencia', 'pagar por zelle', 'pago movil', 'transferencia'
    ],
    tasa: [
      'tasa', 'taza', 'tasa del dolar', 'cuanto esta el dolar',
      'valor del dolar', 'cuanto es la tasa', 'tipo de cambio'
    ],
    ubicacion: [
      'ubicacion', 'direccion', 'donde estan', 'donde queda',
      'donde los puedo encontrar', 'como llegar', 'ubicados'
    ],
    horario: [
      'horario', 'horas de atencion', 'cuando estan abiertos',
      'a que hora abren', 'a que hora cierran', 'dias laborables', 'horarios'
    ]
  }

  const contiene = (lista: string[]) =>
    lista.some(p => normalized.includes(p))

  // 🟡 Pregunta sobre bolívares o tasa
  if (contiene(expresiones.bolivares) || contiene(expresiones.tasa)) {
    const tasaBCV = await obtenerTasaBCV()
    const metodos = ['Pago Móvil', 'Transferencia Bancaria']
      .map(m => `✅ ${m}`).join('\n')

    const tasaTexto = tasaBCV > 0
      ? `📊 Tasa oficial BCV actual: ${tasaBCV.toFixed(2)} Bs/USD`
      : `⚠️ No se pudo obtener la tasa oficial BCV.`

    await sock.sendMessage(from, {
      text: `💳 Aceptamos estos métodos de pago en bolívares:\n\n${metodos}\n\n${tasaTexto}`
    })
    return true
  }

  // 🟡 Métodos de pago (sin moneda)
  if (contiene(expresiones.metodosPago)) {
    const metodos = [
      'Pago Móvil (Banesco)',
      'Transferencia Bancaria (Banesco, Provincial)',
      'Zelle (desde USA)'
    ].map(m => `✅ ${m}`).join('\n')

    await sock.sendMessage(from, {
      text: `💳 Estos son nuestros métodos de pago disponibles:\n\n${metodos}`
    })
    return true
  }

  // 🟡 Ubicación
  if (contiene(expresiones.ubicacion)) {
    const { direccion, telefono, correo, ubicacionURL } = empresaConfig.contacto

    await sock.sendMessage(from, {
      text: `🏠 ¡Hola, ${name}! Aquí está la dirección de nuestra tienda:\n\n📍 *Dirección:* ${direccion}\n🔗 Google Maps: ${ubicacionURL}\n📱 Teléfono: ${telefono}\n✉️ Correo: ${correo}`
    })
    return true
  }

  // 🟡 Horario
  if (contiene(expresiones.horario)) {
    await sock.sendMessage(from, {
      text: `🕒 Nuestro horario de atención es:\n\n🗓️ Lunes a Viernes: 8:00 a.m. a 6:00 p.m.\n🕛 Sábados: hasta mediodía.`
    })
    return true
  }

  return false // No se encontró intención informativa válida
}
