import { LockConfig } from '../../src/domain/game/types'
import { api } from './api'

type LockState = {
  locks: Lock[]
  lock?: Lock
}

type Lock = {
  id: string
  config: LockConfig
}

export const state: LockState = {
  locks: []
}

export async function getLocks() {
  const locks = await api.get<Lock[]>('/locks')
  state.locks = locks
}

export async function createLock(config: LockConfig) {
  const result = await api.post('/lock', config)
}
