/// ✅ src/config/empresaConfig.ts

export const empresaConfig = {
  nombre: 'JCAVALIER',

  admin: {
    numero: '584128966414'
  },

  contacto: {
    telefono: '04121234567',
    correo: 'contacto@jcavalier.com',
    direccion: 'La Coromoto, Calle Mérida Número 5, al lado del Colegio, Unidad Educativa Amelia Linares, Maracay, Edo. Aragua. Venezuela',
    ubicacionURL: 'https://maps.app.goo.gl/jjAyxAFZni7XkSDv5'
  },

  metodosPago: {
    pagoMovil: {
      telefono: '04128966414',
      cedula: '23000000',
      banco: 'Banesco'
    },
    transferenciaBancaria: {
      banco: 'Banesco',
      cuenta: '01240099123121212',
      titular: 'Jhonny Sanchez'
    },
    zelle: {
      correo: 'jcavalier@gmail.com',
      titular: 'ANGEL SEMECO'
    },
    binance: {
      correo: 'jcavalier@gmail.com'
    },
    efectivo: {
      descripcion: 'Pago al recibir el producto'
    }
  },

  opcionesEntrega: {
    retiroPersonal: {
      descripcion: 'Retiro en la tienda, coordinando el horario.',
      ubicacion: 'Nuestra tienda está ubicada en La Coromoto, Calle Mérida Número 5, al lado del Colegio, Unidad Educativa Amelia Linares, Maracay, Edo. Aragua, Venezuela.'
    },
    delivery: {
      descripcion: 'Delivery solo para Maracay centro. Necesitamos tu dirección y contacto.',
      costo: 2
    },
    encomienda: {
      descripcion: 'Envío nacional. Necesitamos detalles de tu dirección completa.'
    }
  },

  colecciones: {
    'Monarch linen': {
      description: 'Camisas de vestir manga larga, elaboradas en tela lino.',
      keywords: ['monarch', 'camisa', 'linen', 'lino', 'manga larga'],
      items: ['camisa', 'blusa'],
      price: 25,
      link: 'https://jcavalier.com'
    },
    'Franela Imperial estilo Old money': {
      description: 'Elaboradas en tela tejida Jacquard suave y ligera.',
      keywords: ['franela', 'imperial', 'old money', 'camisa'],
      items: ['camisa'],
      price: 25,
      link: 'https://jcavalier.com'
    },
    'Chemise Imperial estilo Old money': {
      description: 'Chemises elegantes con corte moderno.',
      keywords: ['chemise', 'old money', 'imperial'],
      items: ['chemise'],
      price: 25,
      link: 'https://jcavalier.com'
    },
    'Set Diamond estilo old money': {
      description: 'Conjunto elegante casual con short o pantalón.',
      keywords: ['diamond', 'conjunto', 'set', 'old money', 'short', 'pantalón'],
      items: ['conjunto', 'set', 'short', 'pantalón'],
      price: 25,
      link: 'https://jcavalier.com'
    },
    'Gold Sport Set Dama': {
      description: 'Conjunto deportivo en tela French Terry.',
      keywords: ['dama', 'deportivo', 'sport', 'gold', 'set'],
      items: ['set', 'dama'],
      price: 25,
      link: 'https://jcavalier.com'
    },
    'Gold Sport Set Caballero': {
      description: 'Conjunto deportivo masculino en tela French Terry.',
      keywords: ['caballero', 'deportivo', 'sport', 'gold', 'set'],
      items: ['set', 'caballero'],
      price: 25,
      link: 'https://jcavalier.com'
    },
    'Sun Set': {
      description: 'Looks tropicales perfectos para playa o verano.',
      keywords: ['sun', 'playa', 'verano', 'conjunto', 'sun set'],
      items: ['conjunto', 'sun set'],
      price: 25,
      link: 'https://jcavalier.com'
    },
    'Camisas Cubanas': {
      description: 'Camisas frescas con aire tropical.',
      keywords: ['cubana', 'camisa', 'camisas'],
      items: ['camisa'],
      price: 25,
      link: 'https://jcavalier.com'
    },
    'Merch Oversize Gladiador': {
      description: 'Estilo oversize con actitud.',
      keywords: ['gladiador', 'oversize', 'merch'],
      items: ['oversize', 'merch'],
      price: 25,
      link: 'https://jcavalier.com'
    }
  },

  mensajes: {
    bienvenida: {
      nuevoUsuario: [
        '¡Hola {nombre}, buenos días! 🌟 Bienvenido a {nombre}. Estoy aquí para ayudarte con lo que necesites. Pregúntame con confianza.',
        '¡Hola {nombre}! Buenos días y bienvenido a {nombre}. Si estás buscando algo especial, llegaste al lugar indicado. 🖤',
        '¡Qué gusto saludarte, {nombre}! Buenos días desde {nombre}. Cuéntame qué estás buscando y comenzamos este viaje de estilo.'
      ],
      usuarioRecurrente: [
        '¡{nombre}, qué alegría tenerte de vuelta! Buenas tardes 😊 ¿En qué puedo ayudarte hoy?',
        '¡Hola otra vez {nombre}! Siempre es un placer saludarte. Buenas tardes.',
        '¡Bienvenido nuevamente, {nombre}! Dime cómo puedo asistirte esta vez.'
      ]
    },
    agradecimiento: '¡Con gusto! Gracias a ti por confiar en *{nombre}*. 🖤 Si necesitas algo más, aquí estoy.',
    seguimiento: '📦 Si ya hiciste un pedido y quieres saber el estado, indícame tu número de orden o tu nombre completo. Estoy aquí para ayudarte.',
    despedida: '¡Hasta pronto! Gracias por visitar *{nombre}*. Que tengas un excelente día. 👋'
  },

  respuestasRapidas: {
    gracias: [
      '¡Con gusto! Gracias a ti por confiar en *{nombre}*. 🖤',
      'Siempre un placer ayudarte, {nombre}. ¡Gracias por preferirnos!',
      '¡Qué alegría saber que estás satisfecho! Gracias por tu apoyo, {nombre}.'
    ],
    despedida: [
      '¡Hasta pronto! Que tengas un excelente día. 👋',
      'Gracias por tu visita, {nombre}. ¡Te esperamos de vuelta pronto!',
      'Nos encanta tener clientes como tú, {nombre}. ¡Vuelve pronto!'
    ]
  },

  palabrasClave: {
    agradecimiento: [
      'gracias', 'muchas gracias', 'mil gracias', 'te lo agradezco',
      'le agradezco', 'agradecido', 'agradecida', 'thank you',
      'thanks', 'appreciate it', 'grateful'
    ]
  },

  linksUtiles: {
    seguimiento: 'https://jcavalier.com/seguimiento',
    preguntasFrecuentes: 'https://jcavalier.com/faq',
    contacto: 'https://wa.me/584128966414',
    instagram: 'https://instagram.com/jcavalier',
    tiktok: 'https://tiktok.com/@jcavalier'
  },

  tiemposEntrega: {
    retiroPersonal: 'El mismo día, coordinando horario.',
    delivery: 'Entre 2 y 6 horas (sólo Maracay centro).',
    encomienda: 'Entre 2 y 4 días hábiles según destino.'
  },

  enlaces: {
    catalogo: 'https://jcavalier.com'
  },

  configuracionBot: {
    saludo: '¡Hola {nombre}! Soy el asistente de {nombre}. ¿En qué puedo ayudarte hoy?',
    recordatorioComprobante: '⏳ Seguimos esperando tu *comprobante de pago* para poder avanzar con la entrega.',
    respuestaFallback: 'Disculpa, ¿podrías contarme un poco más para ayudarte mejor?'
  },

  flujo: {
    bienvenida: 'ecommerceFlow',
    entrega: 'deliveryFlow',
    pago: 'paymentFlow',
    agradecimiento: 'thankyouFlow',
    seguimiento: 'trackingFlow'
  },

  contextoVenezolano: {
    saludo: '¡Qué chévere verte por aquí!',
    contextoDeClima: 'No tenemos estaciones como verano o invierno, pero siempre hace calor, por lo que nuestros productos están pensados para el clima cálido de Venezuela.',
    productoDestacado: 'Conjuntos de playa'
  },

  languages: {
    keywords: {
      'camisa': ['shirt', 'blusa'],
      'conjunto': ['outfit', 'set', 'ropa'],
      'pantalon': ['pants', 'jeans']
    }
  },

  tiposEntrega: {
    retiro: 'Retiro personal en tienda',
    delivery: 'Delivery solo Maracay',
    encomienda: 'Envío nacional'
  },

  prompts: {
    saludo: `
    Eres un estilista digital empático de {nombre}, una marca de moda disruptiva. 
    Debes responder en *español latino*, usando un tono cálido, directo y conectado emocionalmente con el usuario.
    `,
    respuestaCatalogo: `
    Si el usuario está buscando productos, responde como un estilista experto de {nombre}, siempre en español latino. Menciona las colecciones más populares como "Sun Set" o "Monarch Linen", proporcionando enlaces a cada colección.
    `,
    bienvenida: `
    Genera un saludo cálido para el usuario, personalizando el mensaje con su nombre. El mensaje debe ser en español latino y amigable.
    Ejemplo:
    "¡Hola {nombre}, buenos días! 🌟 Bienvenido a {nombre}. Estoy aquí para ayudarte con lo que necesites. Pregúntame con confianza."
    `,
    fallback: `
    Si no entiendes la intención del usuario, responde de forma empática y amigable. Usa un tono cálido y siempre en español latino.
    Ejemplo:
    "Disculpa, ¿podrías contarme un poco más para ayudarte mejor?"
    `
  },

  estadosPedido: [
    'pendiente',
    'pago_verificado',
    'en_fabrica',
    'empaquetado',
    'enviado',
    'en_camino',
    'entregado',
    'recibido',
    'cancelado'
  ],

  mensajesPedido: {
    en_fabrica: '🧵 Tu pedido está en proceso de fabricación. Estará listo en 1 día hábil.',
    empaquetado: '📦 Tu pedido fue empaquetado y está listo para el envío.',
    en_camino: '🚚 Tu pedido ya fue enviado y está en camino.',
    entregado: '✅ Pedido entregado. ¡Gracias por tu compra!',
    recibido: '🎉 ¡Gracias por confirmar que recibiste tu pedido! Esperamos que lo disfrutes.'
  },

  sistema: {
    version: '1.2.5',
    permitirPDF: true,
    permitirQR: true,
    mensajesDebug: false,
    maxIntentosComprobante: 3
  },

  ubicacion: 'La Coromoto, Calle Mérida Número 5, Maracay, Edo. Aragua',
  horario: 'Lunes a Sábado de 9:00 AM a 5:00 PM'
};
