// src/global.d.ts

declare module '@bot-whatsapp/bot' {
  export type Ctx = {
    body: string
    from: string
    pushName?: string
    name?: string
  }

  export type StateHandler = {
    getMyState: () => Promise<Record<string, any>>
    update: (data: Record<string, any>) => Promise<void>
    clear: () => Promise<void>
  }

  export type FlowFnProps = {
    ctx: Ctx
    flowDynamic: (messages: string | string[]) => Promise<void>
    gotoFlow: (flow: any) => Promise<void>
    fallBack: () => Promise<void>
    state: StateHandler
  }

  export function addKeyword(
    keyword: string | string[]
  ): {
    addAction(
      fn: (ctx: Ctx, tools: Omit<FlowFnProps, 'ctx'>) => Promise<void> | void
    ): ReturnType<typeof addKeyword>
  }

  export const EVENTS: {
    WELCOME: 'WELCOME'
    MESSAGE: 'MESSAGE'
    VOICE_NOTE: 'VOICE_NOTE'
    MEDIA: 'MEDIA'
    FILE: 'FILE'
    CONTACT: 'CONTACT'
    LOCATION: 'LOCATION'
  }

  export function createBot(options: any): any
  export function createFlow(flows: any[]): any
}
