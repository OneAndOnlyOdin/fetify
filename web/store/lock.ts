import { LockDomain } from '../../src/domain/game/lock'
import { api } from './api'
import { LockDTO } from '../../src/domain/game/lock/store'
import { time } from '.'

type LockState = {
  locks: ClientLock[]
}

export type ClientLock = LockDTO & { drawSeconds: number }

export const state: LockState = {
  locks: [],
}

setInterval(updateLocks, 900)

export async function getLocks() {
  const locks = await api.get<LockDTO[]>('/api/lock')
  state.locks = locks.map<ClientLock>(lock => ({
    ...lock,
    created: new Date(lock.created),
    drawSeconds: 0,
  }))

  updateLocks()
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

    const until = lock.draw.valueOf() - now
    lock.drawSeconds = until <= 0 ? 0 : Math.floor(until / 1000)
  }
}

const win: any = window
win.clearLocks = (events: boolean = false) =>
  api.post('/api/admin/clear-lock', { events }).then(console.log)
