// ✅ src/intelligence/order.detector.ts

export interface DetectedProduct {
  coleccion: string
  nombre: string
  talla: string
  color: string
  precio: string
  // Añadimos una propiedad para vuelos
  vuelo?: string
  destino?: string
  aeropuerto?: string
}

export interface OrderDetectionResult {
  productos: DetectedProduct[]
  esPedidoValido: boolean
  errores?: string[]
}

export function parseOrderMessage(message: string): OrderDetectionResult {
  const lines = message
    .replace(/%0A/g, '\n') // Convierte saltos codificados en saltos reales
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  const productos: DetectedProduct[] = []
  let currentProduct: Partial<DetectedProduct> = {}
  const errores: string[] = []

  for (const line of lines) {
    // Detectamos Colección
    if (line.startsWith('Colección:')) {
      currentProduct.coleccion = line.replace('Colección:', '').trim()
    } 
    // Detectamos Producto
    else if (line.startsWith('Producto:')) {
      currentProduct.nombre = line.replace('Producto:', '').trim()
    } 
    // Detectamos Talla
    else if (line.startsWith('Talla:')) {
      currentProduct.talla = line.replace('Talla:', '').trim()
    } 
    // Detectamos Color
    else if (line.startsWith('Color:')) {
      currentProduct.color = line.replace('Color:', '').trim()
    } 
    // Detectamos Precio
    else if (line.startsWith('Precio:')) {
      currentProduct.precio = line.replace('Precio:', '').trim()
    } 
    // Detectamos Vuelo
    else if (line.startsWith('Vuelo:')) {
      currentProduct.vuelo = line.replace('Vuelo:', '').trim()
    }
    // Detectamos Destino
    else if (line.startsWith('Destino:')) {
      currentProduct.destino = line.replace('Destino:', '').trim()
    }
    // Detectamos Aeropuerto
    else if (line.startsWith('Aeropuerto:')) {
      currentProduct.aeropuerto = line.replace('Aeropuerto:', '').trim()
    }

    // Verificamos si todos los detalles del producto están completos
    const isComplete =
      currentProduct.coleccion &&
      currentProduct.nombre &&
      currentProduct.talla &&
      currentProduct.color &&
      currentProduct.precio

    if (isComplete) {
      productos.push(currentProduct as DetectedProduct)
      currentProduct = {} // Reiniciar para el siguiente producto
    }
  }

  // Si quedaron campos incompletos al final, los marcamos como errores
  if (Object.keys(currentProduct).length > 0) {
    errores.push(`Producto incompleto al final del mensaje: ${JSON.stringify(currentProduct)}`)
  }

  // Verificamos si hay al menos un producto y no hay errores
  const esPedidoValido = productos.length > 0 && errores.length === 0

  return {
    productos,
    esPedidoValido,
    errores: errores.length > 0 ? errores : undefined
  }
}

/**
 * Verifica si el mensaje contiene detalles de un pedido realizado desde el sitio web
 */
export function contienePedidoDesdeWeb(message: string): boolean {
  // Verificamos si el mensaje contiene los elementos clave para un pedido confirmado desde el sitio
  return (
    message.includes('🧾 Pedido confirmado desde el sitio JCAVALIER') ||
    (message.includes('Colección:') && message.includes('Producto:') && message.includes('Precio:'))
  )
}
