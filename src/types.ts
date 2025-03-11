export interface ChannelEvent<Action extends string, Payload> {
  type: 'event'
  action: Action
  payload: Payload
}

export interface ChannelRequest<Action extends string, Payload> {
  type: 'request'
  requestId: string
  action: Action
  payload: Payload
}

export interface ChannelResponse<Result> {
  type: 'response'
  requestId: string
  result?: Result
}

export type ChannelMessage = ChannelEvent<string, unknown> | ChannelRequest<string, unknown> | ChannelResponse<unknown>

export interface ChannelSchema {
  events: Record<string, unknown>
  // biome-ignore lint/suspicious/noExplicitAny: unknown arguments are not supported
  awaits: Record<string, (...args: any[]) => Promise<unknown>>
}

export interface ChannelInterface<T extends ChannelSchema> {
  onEvent: <K extends keyof T['events'] & string>(action: K, handler: (payload: T['events'][K]) => void) => void
  onAwait: <K extends keyof T['awaits'] & string>(action: K, handler: T['awaits'][K]) => void

  sendEvent: <K extends keyof T['events'] & string>(action: K, payload: T['events'][K]) => void
  sendAwait: <K extends keyof T['awaits'] & string>(
    action: K,
    payload: Parameters<T['awaits'][K]>[0],
  ) => Promise<ReturnType<T['awaits'][K]> extends Promise<infer R> ? R : never>

  destroy: () => void
}
