import { LockDomain } from '../../src/domain/game/lock'
import { api } from './api'
import { LockDTO } from '../../src/domain/game/lock/store'
import { time } from '.'
import { LockAction } from '../../src/domain/game/lock/types'
import { webSockets } from './socket'

type LockState = {
  locks: ClientLock[]
}

export type ClientLock = LockDTO & { drawSeconds: number }

export const state: LockState = {
  locks: [],
}

setInterval(updateLocks, 500)

webSockets.on(({ type, payload }) => {
  if (type !== 'lock') return

  const existing = state.locks.find(lock => lock.id === payload.id)
  if (!existing) {
    state.locks.unshift({ ...payload, drawSeconds: 0 })
    updateLocks()
    return
  }

  state.locks = state.locks.map(lock => {
    if (lock.id !== payload.id) return lock
    return { ...payload, drawSeconds: lock.drawSeconds }
  })
  updateLocks()
})

export async function getLocks() {
  const locks = await api.get<LockDTO[]>('/api/lock')
  state.locks = locks.map<ClientLock>(lock => ({
    ...lock,
    created: new Date(lock.created),
    drawSeconds: 0,
  }))

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

function updateLocks() {
  const now = time.getNow().valueOf()
  for (const lock of state.locks) {
    if (!lock.draw) {
      lock.drawSeconds = 0
      continue
    }

    const draw = new Date(lock.draw)
    const until = draw.valueOf() - now
    lock.drawSeconds = until <= 0 ? 0 : Math.floor(until / 1000)
  }
}

const win: any = window

win.clearLocks = (events: boolean = false) =>
  api.post('/api/admin/clear-lock', { events }).then(console.log)
