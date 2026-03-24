import { describe, expect, it } from 'bun:test'
import type { Turn } from '@craft-agent/ui'
import { getSearchContainerSelectorForTurn } from '../chat-search'

describe('getSearchContainerSelectorForTurn', () => {
  it('does not opt assistant turns into a special DOM search scope', () => {
    const turn = {
      type: 'assistant',
      turnId: 'turn-123',
      activities: [],
      response: {
        text: 'Assistant says zebra',
        isStreaming: false,
        streamStartTime: 0,
        messageId: 'msg-1',
      },
      isStreaming: false,
      isComplete: true,
      timestamp: 1,
    } satisfies Turn

    expect(getSearchContainerSelectorForTurn(turn)).toBeNull()
  })

  it('uses the whole container for user turns', () => {
    const turn = {
      type: 'user',
      timestamp: 1,
      message: {
        id: 'user-1',
        role: 'user',
        content: 'zebra user prompt',
        timestamp: 1,
      },
    } satisfies Turn

    expect(getSearchContainerSelectorForTurn(turn)).toBeNull()
  })
})
