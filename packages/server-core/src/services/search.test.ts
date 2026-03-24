import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { setSearchPlatform, searchSessions } from './search'

const logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  child: () => logger,
}

describe('searchSessions', () => {
  let rootDir: string
  let sessionsDir: string

  beforeEach(() => {
    rootDir = mkdtempSync(join(tmpdir(), 'craft-agent-search-'))
    sessionsDir = join(rootDir, 'sessions')
    mkdirSync(sessionsDir, { recursive: true })

    setSearchPlatform({
      appRootPath: process.cwd(),
      resourcesPath: process.cwd(),
      isPackaged: false,
      logger: logger as never,
    })
  })

  afterEach(() => {
    rmSync(rootDir, { recursive: true, force: true })
  })

  it('finds content in persisted user/assistant session messages', async () => {
    const sessionId = 'session-1'
    const sessionPath = join(sessionsDir, sessionId)
    mkdirSync(sessionPath, { recursive: true })

    const sessionJsonl = [
      JSON.stringify({ id: sessionId, workspaceId: 'ws-1' }),
      JSON.stringify({
        id: 'msg-1',
        content: 'Need help debugging zebra printer issue',
        timestamp: 1,
        attachments: null,
        type: 'user',
      }),
      JSON.stringify({
        id: 'msg-2',
        content: 'Let us troubleshoot the zebra printer issue together',
        timestamp: 2,
        attachments: null,
        type: 'assistant',
      }),
    ].join('\n')

    writeFileSync(join(sessionPath, 'session.jsonl'), sessionJsonl)

    const results = await searchSessions('zebra', sessionsDir, {
      timeout: 5000,
      maxMatchesPerSession: 3,
      maxSessions: 50,
      searchId: 'test-search',
    })

    expect(results).toHaveLength(1)
    expect(results[0]?.sessionId).toBe(sessionId)
    expect(results[0]?.matchCount).toBeGreaterThan(0)
    expect(results[0]?.matches[0]?.snippet.toLowerCase()).toContain('zebra')
  })
})
