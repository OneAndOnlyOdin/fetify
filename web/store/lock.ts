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

export async function getLocks() {
  const { locks, count } = await api.get<{ locks: LockDTO[]; count: number }>('/api/lock')
  const clientLocks: ClientLock[] = []
  state.total = count

  for (const lock of locks) {
    state.locks[lock.id] = {
      ...lock,
      drawSeconds: getDrawSecs(lock.lastHistory?.date),
      created: new Date(lock.created),
    }
    clientLocks.push(state.locks[lock.id])
  }

  return clientLocks
}

export async function getLock(lockId: string) {
  const res = await api.get<LockDTO>(`/api/lock/${lockId}`)
  const lastDraw = new Date(res.lastHistory?.date ?? 0)
  const lock: ClientLock = {
    ...res,
    created: new Date(res.created),
    drawSeconds: getDrawSecs(lastDraw),
  }
  return lock
}

export async function getLatestLock(id: string, version: number) {
  return api.get<LockDTO | void>(`/api/lock/${id}/${version}`)
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

win.clearLocks = (events: boolean = false) => api.post('/api/admin/clear-lock', { events }).then(console.log)
