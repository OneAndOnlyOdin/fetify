import { LockDomain } from '../../src/domain/game/lock'
import { api } from './api'
import { LockDTO } from '../../src/domain/game/lock/store'
import { getNow } from './time'
import { LockAction } from '../../src/domain/game/lock/types'
import { webSockets } from './socket'

export type LockState = {
  locks: { [lockId: string]: ClientLock }
}

export type ClientLock = LockDTO & { drawSeconds: number }

export const state: LockState = {
  locks: {},
}

webSockets.on(msg => {
  switch (msg.type) {
    case 'lock':
      const lock = msg.payload
      const existing = state.locks[lock.id]
      if (!existing) {
        state.locks[lock.id] = { ...lock, drawSeconds: 0 }
        return
      }

      for (const key in existing) {
        if (existing[key] !== lock[key]) {
          existing[key] = lock[key]
        }
      }
  }

  return
})

let debouce = 0
export async function getLocks() {
  if (Date.now() - debouce < 5000) return
  debouce = Date.now()

  const locks = await api.get<LockDTO[]>('/api/lock')
  for (const lock of locks) {
    state.locks[lock.id] = {
      ...lock,
      drawSeconds: 0,
      created: new Date(lock.created),
    }
  }
}

export async function drawLockCard(lockId: string, card: number) {
  const result = await api.post<LockAction>(`/api/lock/${lockId}/draw`, {
    card,
  })
  return result
}

export async function createLock(config: LockDomain.LockConfig) {
  const result = await api.post<string>('/api/lock', config)
  return result
}

export async function joinLock(lockId: string) {
  await api.post<{ message: string }>(`/api/lock/${lockId}/join`)
}

export function getDrawSecs(drawAt?: Date) {
  const now = getNow().valueOf()
  if (!drawAt) return 0
  const draw = new Date(drawAt)
  const until = draw.valueOf() - now
  return until <= 0 ? 0 : Math.floor(until / 1000)
}

const win: any = window

win.clearLocks = (events: boolean = false) =>
  api.post('/api/admin/clear-lock', { events }).then(console.log)
