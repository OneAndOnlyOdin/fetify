import { api } from './api'
import { getNow } from './time'
import { webSockets } from './socket'
import { ActionConfig, LockConfig, LockDTO } from '../../src/domain/lock/types'

export type LockState = {
  locks: { [lockId: string]: ClientLock }
  total: number
}

export type ClientLock = LockDTO & { drawSeconds: number }

export const state: LockState = {
  locks: {},
  total: 0,
}

webSockets.on(msg => {
  switch (msg.type) {
    case 'lock-update': {
      if (!state.locks[msg.payload.id]) return
      for (const key in msg.payload.update) {
        state.locks[msg.payload.id][key] = msg.payload.update[key]
      }
      return
    }

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

let debounce = 0
export async function getLocks() {
  if (Date.now() - debounce < 5000) return
  debounce = Date.now()

  const { locks, count } = await api.get<{ locks: LockDTO[]; count: number }>(
    '/api/lock'
  )
  state.total = count

  for (const lock of locks) {
    state.locks[lock.id] = {
      ...lock,
      drawSeconds: 0,
      created: new Date(lock.created),
    }
  }
}

export async function deleteLock(lockId: string) {
  await api.post(`/api/lock/${lockId}/delete`)
}

export async function renameLock(lockId: string, name: string) {
  await api.post(`/api/lock/${lockId}/rename`, { name })
}

export async function drawLockCard(lockId: string, card: number) {
  const result = await api.post(`/api/lock/${lockId}/draw`, {
    card,
  })
  return result
}

export async function addCards(lockId: string, cards: ActionConfig) {
  await api.post(`/api/lock/${lockId}/add`, { cards })
}

export async function createLock(config: LockConfig) {
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
