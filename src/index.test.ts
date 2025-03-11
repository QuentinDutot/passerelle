import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

// biome-ignore lint/style/noNamespaceImport: needed to test exports
import * as indexExports from '.'
// biome-ignore lint/style/noNamespaceImport: needed to test artifacts
import * as indexArtifacts from '../build/index.js'

describe('exports', () => {
  it('exists with its methods', () => {
    assert.notStrictEqual(indexExports, undefined)
    assert.strictEqual(typeof indexExports.createChannel, 'function')
  })

  it('creates a container and resolves dependencies', async () => {
    const channel = indexExports.createChannel<{
      events: {
        ping: undefined
      }
      awaits: {
        ping: () => Promise<string>
      }
    }>('test-channel')

    let receivedPing = false

    channel.onEvent('ping', () => {
      receivedPing = true
    })

    channel.sendEvent('ping', undefined)

    assert.strictEqual(receivedPing, true)
    channel.destroy()
  })
})

describe('artifacts', () => {
  it('exists with its methods', () => {
    assert.notStrictEqual(indexArtifacts, undefined)
    assert.strictEqual(typeof indexArtifacts.createChannel, 'function')
  })

  it('creates a container and resolves dependencies', () => {
    const channel = indexArtifacts.createChannel<{
      events: {
        ping: undefined
      }
      awaits: {
        ping: () => Promise<string>
      }
    }>('test-channel')

    let receivedPing = false

    channel.onEvent('ping', () => {
      receivedPing = true
    })

    channel.sendEvent('ping', undefined)

    assert.strictEqual(receivedPing, true)
    channel.destroy()
  })
})
