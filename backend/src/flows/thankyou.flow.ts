// ✅ src/flows/thankyou.flow.ts

import { addKeyword, FlowFnProps } from '@bot-whatsapp/bot'
import { empresaConfig } from '../config/empresaConfig'

export const thankyouFlow = addKeyword('FLUJO_FINAL').addAction(
  async (
    ctx: FlowFnProps['ctx'],
    { flowDynamic }: Omit<FlowFnProps, 'ctx'>
  ) => {
    const name = ctx.pushName?.trim() || 'cliente'

    await flowDynamic([
      `🎉 *¡Gracias por tu compra, ${name}!*`,
      '',
      '🧾 Tu pedido fue registrado con éxito y ya está siendo preparado con mucho cariño.',
      '',
      `🖤 *¿Querés seguir explorando nuestra colección?*`,
      `Descubrí nuevas piezas exclusivas aquí:`,
      `🌐 ${empresaConfig.enlaces.catalogo}`,
      '',
      `📲 Si necesitás ayuda, modificar algo o hacer otro pedido, escribime cuando quieras. Estoy para vos.`,
      '',
      `✨ Gracias por confiar en *${empresaConfig.nombre}*.`,
      '¡Hasta pronto y que disfrutes tu compra! 💖'
    ])
  }
)
