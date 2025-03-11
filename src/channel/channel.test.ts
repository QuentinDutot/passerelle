import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createChannel } from './channel'

interface TestSchema {
  events: {
    userLoggedIn: { userId: string; timestamp: number }
    statusChanged: string
  }
  awaits: {
    calculateValue: (params: { x: number; y: number }) => Promise<number>
    fetchUserData: (userId: string) => Promise<{ name: string; email: string }>
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
    const channel = createChannel<TestSchema>('test-requests')

    channel.onAwait('calculateValue', async ({ x, y }) => {
      await new Promise((resolve) => setTimeout(resolve, 100))

      return x * y
    })

    const result = await channel.sendAwait('calculateValue', { x: 10, y: 20 })
    assert.equal(result, 200)
    channel.destroy()
  })

  it('handles complex async requests', async () => {
    const channel = createChannel<TestSchema>('test-complex')

    channel.onAwait('fetchUserData', async (userId) => {
      await new Promise((resolve) => setTimeout(resolve, 100))

      return { name: 'Test User', email: `${userId}@test.com` }
    })

    const userData = await channel.sendAwait('fetchUserData', 'user123')

    assert.deepEqual(userData, {
      name: 'Test User',
      email: 'user123@test.com',
    })
    channel.destroy()
  })

  it('throws error when no handler is registered', async () => {
    const channel = createChannel<TestSchema>('test-error')

    await assert.rejects(
      async () => {
        await channel.sendAwait('calculateValue', { x: 1, y: 2 })
      },
      { message: 'No handler registered for action "calculateValue"' },
    )
    channel.destroy()
  })

  it('handles request timeouts', async () => {
    const channel = createChannel<TestSchema>('test-timeout')

    channel.onAwait('calculateValue', async () => {
      await new Promise((resolve) => setTimeout(resolve, 6000)) // Longer than timeout
      return 42
    })

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
