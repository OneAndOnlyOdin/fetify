import { database } from '../../../db/event'
import { LockConfig, LockAction } from './types'

export type LockSchema = {
  id: string
  ownerId: string
  playerId?: string
  config: LockConfig
  actions: LockAction[]
  history: Array<{ type: LockAction['type']; date: Date }>
  isOpen: boolean
}

export type LockDTO = {
  id: string
  ownerId: string
  playerId?: string
  config: LockConfig
  history: Array<{ type: LockAction['type']; date: Date }>
  counts: { [type in LockAction['type']]?: number }
  isOpen: boolean
}

const coll = database.then(db => db.collection<LockSchema>('gameLock'))

export async function getLocks(userId: string) {
  const locks = await coll.then(coll => coll.find({ userId }))
  return locks
}

export async function upsertLock(lock: LockSchema) {
  await coll.then(coll =>
    coll.updateOne({ id: lock.id }, { $set: lock }, { upsert: true })
  )
}

export function getLock(lockId: string) {
  return coll.then(coll => coll.findOne({ id: lockId }))
}

export function updateLock(id: string, lock: Partial<LockSchema>) {
  return coll.then(coll => coll.updateOne({ id }, { $set: lock }))
}

type ActionCount = { [type in LockAction['type']]?: number }

export function toLockDto(lock: LockSchema): LockDTO {
  const counts = lock.actions.reduce<ActionCount>((prev, curr) => {
    const count = prev[curr.type] || 0
    prev[curr.type] = count + 1
    return prev
  }, {})

  return {
    id: lock.id,
    isOpen: lock.isOpen,
    config: lock.config,
    history: lock.history,
    counts,
    ownerId: lock.ownerId,
    playerId: lock.playerId,
  }
}
