import { describe, expect, it } from 'bun:test'
import type { ActivityItem, AssistantTurn, UserTurn } from '@craft-agent/ui'
import { getSearchMatchesForTurns } from '../chat-search'

describe('getSearchMatchesForTurns', () => {
  it('includes assistant response and activity text when computing search matches', () => {
    const turns = [
      {
        type: 'user',
        timestamp: 1,
        message: {
          id: 'user-1',
          role: 'user',
          content: 'Ask about printer setup',
          timestamp: 1,
        },
      } satisfies UserTurn,
      {
        type: 'assistant',
        turnId: 'turn-1',
        timestamp: 2,
        activities: [
          {
            id: 'activity-1',
            type: 'intermediate',
            status: 'completed',
            content: 'Checking the zebra logs now',
            timestamp: 2,
          } satisfies ActivityItem,
        ],
        response: {
          text: 'The zebra printer issue is caused by the driver spooler.',
          isStreaming: false,
        },
        isStreaming: false,
        isComplete: true,
      } satisfies AssistantTurn,
    ]

    const matches = getSearchMatchesForTurns(turns, 'zebra')

    expect(matches).toHaveLength(2)
    expect(matches.map(match => match.turnId)).toEqual(['turn-turn-1-2', 'turn-turn-1-2'])
    expect(matches.map(match => match.matchId)).toEqual([
      'turn-turn-1-2-match-0',
      'turn-turn-1-2-match-1',
    ])
  })
})
