import { LockDomain } from '../../src/domain/game/lock'
import { api } from './api'
import { LockDTO } from '../../src/domain/game/lock/store'
import { getNow } from './time'
import { LockAction } from '../../src/domain/game/lock/types'
import { webSockets } from './socket'

export type LockState = {
  locks: ClientLock[]
}

export type ClientLock = LockDTO & { drawSeconds: number }

export const state: LockState = {
  locks: [],
}

setInterval(updateLocks, 500)

webSockets.on(msg => {
  switch (msg.type) {
    case 'lock': {
      const existing = state.locks.find(lock => lock.id === msg.payload.id)
      if (!existing) {
        state.locks.unshift({ ...msg.payload, drawSeconds: 0 })
        updateLocks()
        return
      }

      for (const lock of state.locks) {
        if (lock.id !== msg.payload.id) continue

        for (const key in lock) {
          if (lock[key] !== msg.payload[key]) {
            lock[key] = msg.payload[key]
          }
        }
      }

      updateLocks()
      return
    }
  }
})

let debouce = 0
export async function getLocks() {
  if (Date.now() - debouce < 5000) return
  debouce = Date.now()

  const locks = await api.get<LockDTO[]>('/api/lock')
  const mapped = locks.map<ClientLock>(lock => ({
    ...lock,
    created: new Date(lock.created),
    drawSeconds: 0,
  }))

  state.locks.push(...mapped)

  updateLocks()
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

export function getDrawSecs(lock: ClientLock, since?: number) {
  const now = since || getNow().valueOf()
  if (!lock.draw) return 0
  const draw = new Date(lock.draw)
  const until = draw.valueOf() - now
  return until <= 0 ? 0 : Math.floor(until / 1000)
}

function updateLocks() {
  const now = getNow().valueOf()
  for (const lock of state.locks) {
    lock.drawSeconds = getDrawSecs(lock, now)
  }
}

const win: any = window

win.clearLocks = (events: boolean = false) =>
  api.post('/api/admin/clear-lock', { events }).then(console.log)
