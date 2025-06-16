// ✅ src/config/empresaConfig.ts

export const empresaConfig = {
  // Información básica de la empresa
  nombre: 'JCAVALIER',  // Nombre de la empresa

// Información de contacto
contacto: {
  telefono: '0412-123-4567',
  correo: 'contacto@jcavalier.com',
  direccion: 'La Coromoto, Calle Mérida Número 5, al lado del Colegio, Unidad Educativa Amelia Linares, Maracay, Edo. Aragua. Venezuela',  // Dirección de la tienda
  ubicacionURL: 'https://maps.app.goo.gl/jjAyxAFZni7XkSDv5'  // Enlace a Google Maps para la ubicación
},


  // Métodos de pago
  metodosPago: {
    pagoMovil: {
      telefono: '0412-896-6414',
      cedula: '23.000.000',
      banco: 'Banesco',
    },
    transferenciaBancaria: {
      banco: 'Banesco',
      cuenta: '0124 0099 123 121212',
      titular: 'Jhonny Sanchez',
    },
zelle: {
  correo: 'jcavalier@gmail.com',
  titular: 'ANGEL SEMECO'
},

    binance: {
      correo: 'jcavalier@gmail.com',
    },
    efectivo: {
      descripcion: 'Pago al recibir el producto',
    },
  },

  // Opciones de entrega
  opcionesEntrega: {
    retiroPersonal: {
      descripcion: 'Retiro en la tienda, coordinando el horario.',
      ubicacion: 'Nuestra tienda está ubicada en La Coromoto, Calle Mérida Número 5, al lado del Colegio, Unidad Educativa Amelia Linares, Maracay, Edo. Aragua, Venezuela.',
    },
    delivery: {
      descripcion: 'Delivery solo para Maracay centro. Necesitamos tu dirección y contacto.',
    },
    encomienda: {
      descripcion: 'Envío nacional. Necesitamos detalles de tu dirección completa.',
    },
  },

  // Productos y colecciones
  colecciones: {
    'Monarch linen': {
      description: 'Camisas de vestir manga larga, elaboradas en tela lino.',
      keywords: ['monarch', 'camisa', 'linen', 'lino', 'manga larga'],
      items: ['camisa', 'blusa'],
      price: 25,  // Precio actualizado
      link: 'https://j-cavalier.vercel.app',
    },
    'Franela Imperial estilo Old money': {
      description: 'Elaboradas en tela tejida Jacquard suave y ligera.',
      keywords: ['franela', 'imperial', 'old money', 'camisa'],
      items: ['camisa'],
      price: 25,  // Precio actualizado
      link: 'https://j-cavalier.vercel.app',
    },
    'Chemise Imperial estilo Old money': {
      description: 'Chemises elegantes con corte moderno.',
      keywords: ['chemise', 'old money', 'imperial'],
      items: ['chemise'],
      price: 25,  // Precio actualizado
      link: 'https://j-cavalier.vercel.app',
    },
    'Set Diamond estilo old money': {
      description: 'Conjunto elegante casual con short o pantalón.',
      keywords: ['diamond', 'conjunto', 'set', 'old money', 'short', 'pantalón'],
      items: ['conjunto', 'set', 'short', 'pantalón'],
      price: 25,  // Precio actualizado
      link: 'https://j-cavalier.vercel.app',
    },
    'Gold Sport Set Dama': {
      description: 'Conjunto deportivo en tela French Terry.',
      keywords: ['dama', 'deportivo', 'sport', 'gold', 'set'],
      items: ['set', 'dama'],
      price: 25,  // Precio actualizado
      link: 'https://j-cavalier.vercel.app',
    },
    'Gold Sport Set Caballero': {
      description: 'Conjunto deportivo masculino en tela French Terry.',
      keywords: ['caballero', 'deportivo', 'sport', 'gold', 'set'],
      items: ['set', 'caballero'],
      price: 25,  // Precio actualizado
      link: 'https://j-cavalier.vercel.app',
    },
    'Sun Set': {
      description: 'Looks tropicales perfectos para playa o verano.',
      keywords: ['sun', 'playa', 'verano', 'conjunto', 'sun set'],
      items: ['conjunto', 'sun set'],
      price: 25,  // Precio actualizado
      link: 'https://j-cavalier.vercel.app',
    },
    'Camisas Cubanas': {
      description: 'Camisas frescas con aire tropical.',
      keywords: ['cubana', 'camisa', 'camisas'],
      items: ['camisa'],
      price: 25,  // Precio actualizado
      link: 'https://j-cavalier.vercel.app',
    },
    'Merch Oversize Gladiador': {
      description: 'Estilo oversize con actitud.',
      keywords: ['gladiador', 'oversize', 'merch'],
      items: ['oversize', 'merch'],
      price: 25,  // Precio actualizado
      link: 'https://j-cavalier.vercel.app',
    },
  },

  // Mensajes predeterminados del bot
  mensajes: {
    bienvenida: {
      nuevoUsuario: [
        '¡Hola {nombre}, buenos días! 🌟 Bienvenido a {nombre}. Estoy aquí para ayudarte con lo que necesites. Pregúntame con confianza.',
        '¡Hola {nombre}! Buenos días y bienvenido a {nombre}. Si estás buscando algo especial, llegaste al lugar indicado. 🖤',
        '¡Qué gusto saludarte, {nombre}! Buenos días desde {nombre}. Cuéntame qué estás buscando y comenzamos este viaje de estilo.',
      ],
      usuarioRecurrente: [
        '¡{nombre}, qué alegría tenerte de vuelta! Buenas tardes 😊 ¿En qué puedo ayudarte hoy?',
        '¡Hola otra vez {nombre}! Siempre es un placer saludarte. Buenas tardes.',
        '¡Bienvenido nuevamente, {nombre}! Dime cómo puedo asistirte esta vez.',
      ],
    },
    agradecimiento: '¡Con gusto! Gracias a ti por confiar en *{nombre}*. 🖤 Si necesitas algo más, aquí estoy.',
    seguimiento: '📦 Si ya hiciste un pedido y quieres saber el estado, indícame tu número de orden o tu nombre completo. Estoy aquí para ayudarte.',
    despedida: '¡Hasta pronto! Gracias por visitar *{nombre}*. Que tengas un excelente día. 👋',
  },

  // URLs
  enlaces: {
    catalogo: 'https://j-cavalier.vercel.app',  // Enlace al catálogo general de productos
  },

  // Configuración del bot
  configuracionBot: {
    saludo: '¡Hola {nombre}! Soy el asistente de {nombre}. ¿En qué puedo ayudarte hoy?',
    recordatorioComprobante: '⏳ Seguimos esperando tu *comprobante de pago* para poder avanzar con la entrega.',
    respuestaFallback: 'Disculpa, ¿podrías contarme un poco más para ayudarte mejor?',
  },

  // Flujos de conversación
  flujo: {
    bienvenida: 'ecommerceFlow',
    entrega: 'deliveryFlow',
    pago: 'paymentFlow',
    agradecimiento: 'thankyouFlow',
    seguimiento: 'trackingFlow',
  },
  
  // Información regional
  contextoVenezolano: {
    saludo: '¡Qué chévere verte por aquí!',
    contextoDeClima: 'No tenemos estaciones como verano o invierno, pero siempre hace calor, por lo que nuestros productos están pensados para el clima cálido de Venezuela.',
    productoDestacado: 'Conjuntos de playa',
  },
  
  // Aquí agregamos la propiedad languages
  languages: {
    keywords: {
      'camisa': ['shirt', 'blusa'],
      'conjunto': ['outfit', 'set', 'ropa'],
      'pantalon': ['pants', 'jeans'],
      // Otros sinónimos para productos
    },
  },

  // Información de tipo de entrega
  tiposEntrega: {
    retiro: 'Retiro personal en tienda',
    delivery: 'Delivery solo Maracay',
    encomienda: 'Envío nacional',
  },

  // Prompts para OpenAI
  prompts: {
    saludo: `
    Eres un estilista digital empático de {nombre}, una marca de moda disruptiva. 
    Debes responder en *español latino*, usando un tono cálido, directo y conectado emocionalmente con el usuario.
    `,

    // Respuesta para productos en el catálogo
    respuestaCatalogo: `
    Si el usuario está buscando productos, responde como un estilista experto de {nombre}, siempre en español latino. Menciona las colecciones más populares como "Sun Set" o "Monarch Linen", proporcionando enlaces a cada colección.
    `,

    // Respuesta de bienvenida
    bienvenida: `
    Genera un saludo cálido para el usuario, personalizando el mensaje con su nombre. El mensaje debe ser en español latino y amigable.
    Ejemplo:
    "¡Hola {nombre}, buenos días! 🌟 Bienvenido a {nombre}. Estoy aquí para ayudarte con lo que necesites. Pregúntame con confianza."
    `,

    // Respuesta en caso de no entender la intención
    fallback: `
    Si no entiendes la intención del usuario, responde de forma empática y amigable. Usa un tono cálido y siempre en español latino.
    Ejemplo:
    "Disculpa, ¿podrías contarme un poco más para ayudarte mejor?"
    `,
  },
};
