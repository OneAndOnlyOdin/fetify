import { LockDomain } from '../../src/domain/game/lock'
import { api } from './api'
import { LockDTO } from '../../src/domain/game/lock/store'
import { time } from '.'
import { LockAction } from '../../src/domain/game/lock/types'
import { webSockets } from './socket'

type LockState = {
  locks: ClientLock[]
  draw: {
    currentId: string
    card: number
    action: LockAction | null
  }
}

export type ClientLock = LockDTO & { drawSeconds: number }

export const state: LockState = {
  locks: [],
  draw: {
    currentId: '',
    card: -1,
    action: null,
  },
}

setInterval(updateLocks, 500)

webSockets.on(msg => {
  switch (msg.type) {
    case 'lock-draw': {
      if (msg.payload.lockId !== state.draw.currentId) return
      state.draw.card = msg.payload.card
      state.draw.action = msg.payload.action

      setTimeout(() => {
        state.draw.card = -1
        state.draw.action = null
      }, 3000)
      return
    }

    case 'lock': {
      const existing = state.locks.find(lock => lock.id === msg.payload.id)
      if (!existing) {
        state.locks.unshift({ ...msg.payload, drawSeconds: 0 })
        updateLocks()
        return
      }

      state.locks = state.locks.map(lock => {
        if (lock.id !== msg.payload.id) return lock
        return { ...msg.payload, drawSeconds: lock.drawSeconds }
      })
      updateLocks()
      return
    }
  }
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

export async function joinLock(lockId: string) {
  await api.post<{ message: string }>(`/api/lock/${lockId}/join`)
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
