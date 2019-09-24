import { LockDomain } from '../../src/domain/game/lock'
import { api } from './api'
import { LockDTO } from '../../src/domain/game/lock/store'

type LockState = {
  locks: LockDTO[]
  lock?: LockDTO
}

export const state: LockState = {
  locks: [],
}

export async function getLocks() {
  const locks = await api.get<LockDTO[]>('/api/lock')
  state.locks = locks
}

export async function createLock(config: LockDomain.LockConfig) {
  const result = await api.post<string>('/api/lock', config)
  return result
}
