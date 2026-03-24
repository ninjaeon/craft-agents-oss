import type { Turn } from '@craft-agent/ui'

/**
 * Derive a turn key matching ChatDisplay's getTurnKey().
 * Must stay in sync with the local function in ChatDisplay.tsx.
 */
function getTurnKey(turn: Turn): string {
  if (turn.type === 'user') return `user-${turn.message.id}`
  if (turn.type === 'system') return `system-${turn.message.id}`
  if (turn.type === 'auth-request') return `auth-${turn.message.id}`
  return `turn-${turn.turnId}-${turn.timestamp}`
}

function countOccurrencesInText(text: string, query: string): number {
  if (!query || !text) return 0

  let count = 0
  let pos = 0
  let matchPos = text.toLowerCase().indexOf(query.toLowerCase(), pos)

  while (matchPos !== -1) {
    count++
    pos = matchPos + query.length
    matchPos = text.toLowerCase().indexOf(query.toLowerCase(), pos)
  }

  return count
}

export function getSearchContainerSelectorForTurn(turn: Turn): string | null {
  if (turn.type === 'assistant') {
    return null
  }

  return null
}

function getTurnSearchText(turn: Turn): { turnId: string; textContent: string } {
  const turnId = getTurnKey(turn)

  if (turn.type === 'user') {
    const content = turn.message.content as unknown

    if (typeof content === 'string') {
      return { turnId, textContent: content }
    }

    if (Array.isArray(content)) {
      const textContent = content
        .filter((block: { type?: string }) => block.type === 'text')
        .map((block: { text?: string }) => block.text || '')
        .join('\n')
      return { turnId, textContent }
    }

    return { turnId, textContent: '' }
  }

  if (turn.type === 'assistant') {
    const parts: string[] = []

    if (turn.response?.text) {
      parts.push(turn.response.text)
    }

    for (const activity of turn.activities) {
      if (activity.content) {
        parts.push(activity.content)
      }
      if (activity.error) {
        parts.push(activity.error)
      }
      if (activity.intent) {
        parts.push(activity.intent)
      }
    }

    return { turnId, textContent: parts.join('\n') }
  }

  if (turn.type === 'system') {
    return {
      turnId,
      textContent: turn.message.content,
    }
  }

  return {
    turnId,
    textContent: typeof turn.message.content === 'string' ? turn.message.content : '',
  }
}

export function getSearchMatchesForTurns(
  turns: Turn[],
  searchQuery: string,
): Array<{ matchId: string; turnId: string; turnIndex: number; matchIndexInTurn: number }> {
  if (!searchQuery.trim()) return []

  const query = searchQuery.toLowerCase()
  const matches: Array<{ matchId: string; turnId: string; turnIndex: number; matchIndexInTurn: number }> = []

  for (let turnIndex = 0; turnIndex < turns.length; turnIndex++) {
    const turn = turns[turnIndex]
    const { turnId, textContent } = getTurnSearchText(turn)
    const occurrenceCount = countOccurrencesInText(textContent, query)

    for (let i = 0; i < occurrenceCount; i++) {
      matches.push({
        matchId: `${turnId}-match-${i}`,
        turnId,
        turnIndex,
        matchIndexInTurn: i,
      })
    }
  }

  return matches
}
