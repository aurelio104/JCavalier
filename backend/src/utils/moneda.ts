export function detectarMoneda(texto: string): 'VES' | 'USD' | 'UNKNOWN' {
  const original = texto
  const normalizado = texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

  // Expresiones clave
  const vesRegex = /\b(bs|bol[ií]vares?|bolivar(es)?)\b/
  const usdRegex = /\b(d[oó]lares?|usd|usdt|dls|dlls)\b|(\$+)/

  const vesIndex = original.search(vesRegex)
  const usdIndex = original.search(usdRegex)

  // Ambos encontrados → se prioriza el primero que aparezca
  if (vesIndex >= 0 && usdIndex >= 0) {
    return vesIndex < usdIndex ? 'VES' : 'USD'
  }

  if (vesIndex >= 0) return 'VES'
  if (usdIndex >= 0) return 'USD'
  return 'UNKNOWN'
}
