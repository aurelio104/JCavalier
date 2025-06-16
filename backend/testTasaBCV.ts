import axios from 'axios'

async function testObtenerTasaBCV() {
  console.log('📡 Probando API pública de DolarApi.com (Región Venezuela)...\n')

  try {
    const res = await axios.get('https://ve.dolarapi.com/v1/dolares')
    const bcvObj = res.data.find((x: any) => x.fuente.toLowerCase() === 'oficial')

    if (!bcvObj) throw new Error('❗ No se encontró la cotización oficial en la respuesta.')

    const tasa = parseFloat(bcvObj.promedio)
    if (isNaN(tasa) || tasa <= 0) throw new Error('❗ Tasa oficial inválida.')

    console.log('\n✅ Tasa BCV (oficial) obtenida exitosamente:', tasa)
  } catch (error: any) {
    console.error('\n❌ Error al obtener tasa BCV:')
    console.error('🔴 Mensaje:', error.message)
    if (error.response) {
      console.error('📦 Código HTTP:', error.response.status)
      console.error('📦 Cuerpo:', error.response.data)
    }
  }
}

testObtenerTasaBCV()
