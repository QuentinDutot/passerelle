import type {
  ChannelEvent,
  ChannelInterface,
  ChannelMessage,
  ChannelRequest,
  ChannelResponse,
  ChannelSchema,
} from '../types'

export const createChannel = <T extends ChannelSchema>(channelName: string): ChannelInterface<T> => {
  const channel = new BroadcastChannel(channelName)

  const eventHandlers = new Map<string, Set<(payload: unknown) => void>>()
  const awaitHandlers = new Map<string, T['awaits'][keyof T['awaits']]>()

  const pendingRequests = new Map<
    string,
    {
      resolve: (value: unknown) => void
      reject: (reason: unknown) => void
      timeout: number
    }
  >()

  const handleEventMessage = (message: ChannelEvent<string, unknown>): void => {
    const handlers = eventHandlers.get(message.action)
    if (!handlers) return

    for (const handler of handlers) {
      handler(message.payload)
    }
  }

  const handleRequestMessage = async (message: ChannelRequest<string, unknown>): Promise<void> => {
    const handler = awaitHandlers.get(message.action)
    if (!handler) {
      throw new Error(`No handler registered for action "${message.action}"`)
    }

    const result = await handler(message.payload)

    channel.postMessage({
      type: 'response',
      requestId: message.requestId,
      result,
    } satisfies ChannelResponse<unknown>)
  }

  const handleResponseMessage = (message: ChannelResponse<unknown>): void => {
    const pending = pendingRequests.get(message.requestId)
    if (!pending) return

    clearTimeout(pending.timeout)
    pendingRequests.delete(message.requestId)

    pending.resolve(message.result)
  }

  const handleMessage = (message: MessageEvent<ChannelMessage>): void => {
    switch (message.data.type) {
      case 'event':
        handleEventMessage(message.data)
        break
      case 'request':
        handleRequestMessage(message.data)
        break
      case 'response':
        handleResponseMessage(message.data)
        break
      default:
        throw new Error(`Unknown message type received "${message}"`)
    }
  }

  const onEvent = <K extends keyof T['events'] & string>(
    action: K,
    handler: (payload: T['events'][K]) => void,
  ): void => {
    if (!eventHandlers.has(action)) {
      eventHandlers.set(action, new Set())
    }

    const handlers = eventHandlers.get(action)
    if (handlers) {
      handlers.add(handler as (payload: unknown) => void)
    }
  }

  const onAwait = <K extends keyof T['awaits'] & string>(action: K, handler: T['awaits'][K]): void => {
    awaitHandlers.set(action, handler)
  }

  const sendEvent = <K extends keyof T['events'] & string>(action: K, payload: T['events'][K]): void => {
    // Call local handlers first
    const handlers = eventHandlers.get(action)
    if (handlers) {
      for (const handler of handlers) {
        handler(payload)
      }
    }

    // Then broadcast to other channels
    channel.postMessage({
      type: 'event',
      action,
      payload,
    } satisfies ChannelEvent<K, T['events'][K]>)
  }

  const sendAwait = <K extends keyof T['awaits'] & string>(
    action: K,
    payload: Parameters<T['awaits'][K]>[0],
  ): Promise<ReturnType<T['awaits'][K]> extends Promise<infer R> ? R : never> => {
    return new Promise((resolve, reject) => {
      const requestId = Date.now().toString(36) + Math.random().toString(36).substring(2)

      const timeout = setTimeout(() => {
        if (pendingRequests.has(requestId)) {
          pendingRequests.delete(requestId)
          reject(new Error(`Request timeout: ${action}`))
        }
      }, 5000) as unknown as number

      // @ts-expect-error
      pendingRequests.set(requestId, { resolve, reject, timeout })

      channel.postMessage({
        type: 'request',
        requestId,
        action,
        payload,
      } satisfies ChannelRequest<K, Parameters<T['awaits'][K]>[0]>)
    })
  }

  const destroy = (): void => {
    channel.removeEventListener('message', handleMessage)

    for (const [_id, { reject }] of pendingRequests.entries()) {
      reject(new Error('Channel closed'))
    }

    pendingRequests.clear()
    eventHandlers.clear()
    awaitHandlers.clear()

    channel.close()
  }

  channel.addEventListener('message', handleMessage)

  return {
    onEvent,
    onAwait,
    sendEvent,
    sendAwait,
    destroy,
  }
}
