import { database } from '../../../db/event'
import { LockConfig, LockAction, LockHistory } from './types'
import { secondsTilDraw } from './util'

export type LockSchema = {
  id: string
  created: Date
  ownerId: string
  playerId?: string
  config: LockConfig
  actions: LockAction[]
  history: LockHistory[]
  isOpen: boolean
}

export type LockDTO = {
  id: string
  created: Date
  ownerId: string
  playerId?: string
  config: LockConfig
  history: LockHistory[]
  counts?: { [type in LockAction['type']]?: number }
  totalActions: number
  isOpen: boolean
  unlockDate?: Date
  draw?: Date
}

const coll = database.then(db => db.collection<LockSchema>('gameLock'))

export async function getLocks(userId: string) {
  const locks = await coll.then(coll =>
    coll
      .find({
        $or: [{ ownerId: { $eq: userId } }, { playerId: { $eq: userId } }],
      })
      .toArray()
  )
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

export function toLockDto(lock: LockSchema, forUser: string): LockDTO {
  const counts = getCounts(lock, forUser)
  const seconds = secondsTilDraw({
    history: lock.history,
    since: new Date(),
    config: lock.config,
  })
  const draw = seconds > 0 ? new Date(Date.now() + seconds * 1000) : undefined

  const lastHistory = lock.history.slice(-1)[0]
  const unlockDate = lastHistory && !lock.isOpen ? undefined : lastHistory.date

  return {
    id: lock.id,
    created: lock.created,
    isOpen: lock.isOpen,
    config: lock.config,
    history: lock.history,
    ownerId: lock.ownerId,
    playerId: lock.playerId,
    draw,
    unlockDate,
    ...counts,
  }
}

function getCounts(lock: LockSchema, forUser: string) {
  const totalActions = lock.actions.length
  if (lock.playerId === forUser && !lock.config.showActions) {
    return { totalActions }
  }

  const counts = lock.actions.reduce<ActionCount>((prev, curr) => {
    const count = prev[curr.type] || 0
    prev[curr.type] = count + 1
    return prev
  }, {})

  return { counts, totalActions }
}
