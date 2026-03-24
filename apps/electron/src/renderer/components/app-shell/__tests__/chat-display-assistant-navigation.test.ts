import { describe, expect, it } from 'bun:test'
import type { AssistantTurn } from '@craft-agent/ui'
import { getSearchMatchesForTurns } from '../chat-search'

describe('assistant logical match navigation', () => {
  it('keeps stable occurrence ordering for assistant response-only matches', () => {
    const turns = [
      {
        type: 'assistant',
        turnId: 'turn-42',
        timestamp: 2,
        activities: [],
        response: {
          text: 'zebra one zebra two zebra three',
          isStreaming: false,
          messageId: 'msg-42',
        },
        isStreaming: false,
        isComplete: true,
      } satisfies AssistantTurn,
    ]

    const matches = getSearchMatchesForTurns(turns, 'zebra')

    expect(matches).toHaveLength(3)
    expect(matches.map(match => match.turnId)).toEqual([
      'turn-turn-42-2',
      'turn-turn-42-2',
      'turn-turn-42-2',
    ])
    expect(matches.map(match => match.matchIndexInTurn)).toEqual([0, 1, 2])
    expect(matches.map(match => match.matchId)).toEqual([
      'turn-turn-42-2-match-0',
      'turn-turn-42-2-match-1',
      'turn-turn-42-2-match-2',
    ])
  })

  it('handles large match counts without stack overflow (regression: Math.min spread crash)', () => {
    // Simulate a long session: 200 turns each containing 500+ occurrences of "a"
    // This previously crashed via Math.min(...matchingOccurrences.map(m => m.turnIndex))
    const turns: AssistantTurn[] = Array.from({ length: 200 }, (_, i) => ({
      type: 'assistant' as const,
      turnId: `turn-${i}`,
      timestamp: i,
      activities: [],
      response: {
        text: 'a '.repeat(500), // 500 occurrences of "a" per turn
        isStreaming: false,
        messageId: `msg-${i}`,
      },
      isStreaming: false,
      isComplete: true,
    }))

    // Should not throw RangeError: Maximum call stack size exceeded
    const matches = getSearchMatchesForTurns(turns, 'a')

    // 200 turns × 500 occurrences = 100,000 matches
    expect(matches.length).toBe(100_000)
    // All turn indices should be present
    expect(matches[0]!.turnIndex).toBe(0)
    expect(matches[matches.length - 1]!.turnIndex).toBe(199)
  })
})
