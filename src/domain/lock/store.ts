import { database } from '../../db/event'
import { LockConfig, LockAction, LockHistory, LockDTO } from './types'
import { secondsTilDraw } from './util'

export type LockSchema = {
  id: string
  name?: string
  deleted?: boolean
  created: Date
  ownerId: string
  playerId?: string
  config: LockConfig
  actions: LockAction[]
  history: LockHistory[]
  unlocksFound: number
  isOpen: boolean
  version: number
}

export type LockState = {
  aggregateId: string
  state: 'created' | 'resolved'
  joinable: boolean
}

const coll = database.then(db => db.collection<LockSchema>('gameLock'))

export function getLockState(id: string) {
  return lockState.then(tbl => tbl.findOne({ aggregateId: id }))
}

export const lockState = database.then(db => db.collection<LockState>('lockState'))

export async function getLocks(userId: string) {
  const query = {
    $and: [
      { deleted: { $ne: true } },
      {
        $or: [{ ownerId: { $eq: userId } }, { playerId: { $eq: userId } }],
      },
    ],
  }
  const count = await coll.then(coll => coll.find(query).count())
  const locks = await coll.then(coll =>
    coll
      .find(query)
      .project({ _id: 0 })
      .sort({ created: -1 })
      .toArray()
  )
  return { locks, count }
}

export async function upsertLock(lock: LockSchema) {
  await coll.then(coll => coll.updateOne({ id: lock.id }, { $set: lock }, { upsert: true }))
}

export function getLock(lockId: string, version?: number) {
  if (!version) {
    return coll.then(coll => coll.findOne({ id: lockId, deleted: { $ne: false } }))
  }

  return coll.then(coll => coll.findOne({ id: lockId, version, deleted: { $ne: false } }))
}

export function updateLock(id: string, lock: Partial<LockSchema>) {
  return coll.then(coll => coll.updateOne({ id }, { $set: lock }))
}

type ActionCount = { [type in LockAction['type']]?: number }

export function toLockDto(lock: LockSchema, forUser: string): LockDTO {
  const counts = getCounts(lock, forUser)
  const seconds = secondsTilDraw({
    history: lock.history,
    since: new Date(Date.now()),
    config: lock.config,
  })
  const draw = seconds > 0 ? new Date(Date.now() + seconds * 1000) : undefined

  const lastHistory = lock.history.slice(-1)[0]
  const unlockDate = lastHistory && lock.isOpen ? lastHistory.date : undefined

  lock.history.slice().sort(sortTimeDesc)

  return {
    id: lock.id,
    version: lock.version,
    name: lock.name,
    deleted: lock.deleted,
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

function sortTimeDesc(l: LockHistory, r: LockHistory) {
  return l.date > r.date ? -1 : l.date == r.date ? 0 : 1
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
