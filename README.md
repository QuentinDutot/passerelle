# PasserelleJS

[![npm](https://img.shields.io/npm/v/passerelle.svg?maxAge=1000)](https://www.npmjs.com/package/passerelle)
[![npm](https://img.shields.io/npm/dt/passerelle.svg?maxAge=1000)](https://www.npmjs.com/package/passerelle)
[![CI](https://github.com/QuentinDutot/passerelle/actions/workflows/ci.yml/badge.svg)](https://github.com/QuentinDutot/passerelle/actions/workflows/ci.yml)

TypeScript **BroadcastChannel** wrapper for structured **Events** and **Async/Await**.

It supports **Event-driven Communication**, **Request/Response Pattern**, **Timeout Handling**, and **Type-safe Messaging**.

- 🪶 1.2KB minified
- 🧩 Zero dependencies
- 📦 TypeScript and ESM
- 🧪 100% Test Coverage
- 🌐 Web Worker, Iframe, Multi-Tab

## 🚀 Usage

```js
import { createChannel } from 'passerelle'

interface ChannelInterface {
  events: {
    sayHello: string
  }
  awaits: {
    performCalculation: (a: number, b: number) => Promise<number>
  }
}

const channel = createChannel<ChannelInterface>('channel-name')

channel.onEvent('sayHello', console.log)

channel.onAwait('performCalculation', (a: number, b: number) => {
  // simulate expensive calculation that could be running in a worker
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return a + b
})

const result = await channel.sendAwait('performCalculation', 10, 20)
console.log(result) // 30
```

## 🔋 APIs

Creates a new channel, using the [Broadcast Channel API](https://developer.mozilla.org/fr/docs/Web/API/Broadcast_Channel_API).

```js
createChannel(name: string): ChannelInstance
```

### onEvent

Registers a listener to receive event messages.

```js
channel.onEvent(action: string, (payload: T) => void): void
```

### onAwait

Registers a listener to handle await messages.

```js
channel.onAwait(action: string, (payload: T) => Promise<U>): void
```

### sendEvent

Sends an event message to listeners.

```js
channel.sendEvent(action: string, payload: T): void
```

### sendAwait

Sends an await message to listeners.

```js
channel.sendAwait(action: string, payload: T): Promise<U>
```

### destroy

Closes the channel, aborts pending awaits and clears listeners.

```js
channel.destroy(): void
```

## 📃 Inspiration

This project was inspired by [GoogleChromeLabs/comlink](https://github.com/GoogleChromeLabs/comlink) and builds upon its core concepts.
