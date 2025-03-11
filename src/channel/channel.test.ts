import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createChannel } from './channel'

interface TestSchema {
  events: {
    userLoggedIn: { userId: string; timestamp: number }
    statusChanged: string
  }
  awaits: {
    calculateValue: (params: { x: number; y: number }) => number
    fetchUserData: (userId: string) => { name: string; email: string }
  }
}

describe('channel', () => {
  it('returns an object with methods', () => {
    const channel = createChannel<TestSchema>('test-methods')
    assert.strictEqual(typeof channel, 'object')
    assert.strictEqual(typeof channel.onEvent, 'function')
    assert.strictEqual(typeof channel.onAwait, 'function')
    assert.strictEqual(typeof channel.sendEvent, 'function')
    assert.strictEqual(typeof channel.sendAwait, 'function')
    assert.strictEqual(typeof channel.destroy, 'function')
  })

  it('handles events correctly', async () => {
    const channel = createChannel<TestSchema>('test-events')
    const receivedEvents: unknown[] = []

    channel.onEvent('userLoggedIn', (data) => {
      receivedEvents.push(data)
    })

    channel.onEvent('statusChanged', (status) => {
      receivedEvents.push(status)
    })

    const loginData = { userId: '123', timestamp: Date.now() }
    channel.sendEvent('userLoggedIn', loginData)
    channel.sendEvent('statusChanged', 'active')

    await new Promise((resolve) => setTimeout(resolve, 100))

    assert.deepEqual(receivedEvents, [loginData, 'active'])
    channel.destroy()
  })

  it('handles multiple event listeners', async () => {
    const channel = createChannel<TestSchema>('test-multiple')
    const results: string[] = []

    channel.onEvent('statusChanged', (status) => results.push(`listener1: ${status}`))
    channel.onEvent('statusChanged', (status) => results.push(`listener2: ${status}`))

    channel.sendEvent('statusChanged', 'busy')

    await new Promise((resolve) => setTimeout(resolve, 100))

    assert.deepEqual(results, ['listener1: busy', 'listener2: busy'])
    channel.destroy()
  })

  it('handles async requests correctly', async () => {
    const mainChannel = createChannel<TestSchema>('test-requests')
    const workerChannel = createChannel<TestSchema>('test-requests')

    workerChannel.onAwait('calculateValue', ({ x, y }) => x * y)

    const result = await mainChannel.sendAwait('calculateValue', { x: 10, y: 20 })
    assert.equal(result, 200)
    mainChannel.destroy()
    workerChannel.destroy()
  })

  it('handles request timeouts', async () => {
    const channel = createChannel<TestSchema>('test-timeout')

    channel.onAwait('calculateValue', () => 42)

    await assert.rejects(
      async () => {
        await channel.sendAwait('calculateValue', { x: 1, y: 2 })
      },
      { message: 'Request timeout: calculateValue' },
    )
    channel.destroy()
  })

  it('cleans up resources on destroy', async () => {
    const channel = createChannel<TestSchema>('test-destroy')

    const pendingPromise = channel.sendAwait('calculateValue', { x: 1, y: 2 })
    channel.destroy()

    await assert.rejects(
      async () => {
        await pendingPromise
      },
      { message: 'Channel closed' },
    )
  })
})
