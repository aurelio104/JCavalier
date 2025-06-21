export interface DetectedProduct {
  coleccion: string
  nombre: string
  talla: string
  color: string
  precio: string
  vuelo?: string
  destino?: string
  aeropuerto?: string
}

export interface OrderDetectionResult {
  productos: DetectedProduct[]
  esPedidoValido: boolean
  errores?: string[]
  mensajeAlCliente?: string
}

/**
 * Extrae información estructurada desde un mensaje de texto tipo pedido.
 * Reconoce campos: colección, producto, talla, color, precio, y datos de vuelo (si aplica).
 */
export function parseOrderMessage(message: string): OrderDetectionResult {
  const lines = message
    .replace(/%0A/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  const productos: DetectedProduct[] = [];
  let currentProduct: Partial<DetectedProduct> = {};
  const errores: string[] = [];

  for (const line of lines) {
    if (line.startsWith('Colección:')) {
      currentProduct.coleccion = line.replace('Colección:', '').trim();
    } else if (line.startsWith('Producto:')) {
      currentProduct.nombre = line.replace('Producto:', '').trim();
    } else if (line.startsWith('Talla:')) {
      currentProduct.talla = line.replace('Talla:', '').trim();
    } else if (line.startsWith('Color:')) {
      currentProduct.color = line.replace('Color:', '').trim();
    } else if (line.startsWith('Precio:')) {
      currentProduct.precio = line.replace('Precio:', '').trim();
    } else if (line.startsWith('Vuelo:')) {
      currentProduct.vuelo = line.replace('Vuelo:', '').trim();
    } else if (line.startsWith('Destino:')) {
      currentProduct.destino = line.replace('Destino:', '').trim();
    } else if (line.startsWith('Aeropuerto:')) {
      currentProduct.aeropuerto = line.replace('Aeropuerto:', '').trim();
    }

    const isComplete =
      currentProduct.coleccion &&
      currentProduct.nombre &&
      currentProduct.talla &&
      currentProduct.color &&
      currentProduct.precio;

    if (isComplete) {
      productos.push(currentProduct as DetectedProduct);
      currentProduct = {};
    }
  }

  if (Object.keys(currentProduct).length > 0) {
    errores.push(`⚠️ Producto incompleto al final del mensaje: ${JSON.stringify(currentProduct)}`);
  }

  const esPedidoValido = productos.length > 0 && errores.length === 0;

  return {
    productos,
    esPedidoValido,
    errores: errores.length > 0 ? errores : undefined,
    mensajeAlCliente: errores.length > 0
      ? '⚠️ Tu pedido está incompleto. Por favor, indícame *nombre del producto*, *talla*, *color* y *precio* para procesarlo correctamente.'
      : undefined
  };
}

/**
 * Detecta si el mensaje proviene del sitio web oficial o contiene formato de pedido.
 */
export function contienePedidoDesdeWeb(message: string): boolean {
  return (
    message.includes('🧾 Pedido confirmado desde el sitio JCAVALIER') ||
    (message.includes('Colección:') && message.includes('Producto:') && message.includes('Precio:'))
  );
}
