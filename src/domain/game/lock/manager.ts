import { eventHandler } from '../../../es'
import { LockEvent } from './types'
import { upsertLock, LockSchema, getLock, updateLock, toLockDto } from './store'
import { svcSockets } from '../../../sockets/publish'
import { lockCmd } from './command'

export const lockMgr = eventHandler.createMongoHandler<LockEvent>({
  bookmark: 'lock-bookmark',
  eventStream: 'gameLock',
  name: 'lock-manager',
})

lockMgr.handle('LockCreated', async ({ event, timestamp }) => {
  const lock: LockSchema = {
    id: event.aggregateId,
    created: timestamp,
    isOpen: false,
    actions: event.actions,
    config: event.config,
    ownerId: event.ownerId,
    history: [],
  }

  await upsertLock(lock)

  svcSockets.toUser(lock.ownerId, {
    type: 'lock',
    payload: toLockDto(lock, lock.ownerId),
  })
})

lockMgr.handle('CardDrawn', async ({ event, timestamp }) => {
  const lock = await getLock(event.aggregateId)
  if (!lock) {
    throw new Error('Lock state not found')
  }

  const item = { type: event.cardType, date: timestamp }
  const nextLock = {
    ...lock,
    actions: event.actions,
    history: lock.history.concat(item),
  }

  await updateLock(event.aggregateId, {
    actions: nextLock.actions,
    history: nextLock.history,
  })

  svcSockets.toUser(nextLock.ownerId, {
    type: 'lock',
    payload: toLockDto(nextLock, nextLock.ownerId),
  })

  if (lock.playerId) {
    svcSockets.toUser(lock.playerId, {
      type: 'lock',
      payload: toLockDto(nextLock, lock.playerId),
    })
  }

  if (event.cardType !== 'unlock') return

  const unlocks = lock.config.actions.filter(action => action.type === 'unlock')
    .length
  const seen = lock.history.filter(hist => hist.type === 'unlock').length + 1

  if (seen >= unlocks) {
    await lockCmd.CompleteLock({ aggregateId: event.aggregateId })
  }
})

lockMgr.handle('LockJoined', async ({ event }) => {
  const lock = await getLock(event.aggregateId)
  if (!lock) {
    throw new Error('Lock state not found')
  }

  await updateLock(event.aggregateId, {
    playerId: event.userId,
  })

  lock.playerId = event.userId

  svcSockets.toUser(event.userId, {
    type: 'lock',
    payload: toLockDto(lock, event.userId),
  })

  svcSockets.toUser(lock.ownerId, {
    type: 'lock',
    payload: toLockDto(lock, lock.ownerId),
  })
})

lockMgr.handle('LockCancelled', async ({ aggregateId }) => {
  await updateLock(aggregateId, { isOpen: true })
})

lockMgr.handle('LockOpened', async ({ aggregateId }) => {
  await updateLock(aggregateId, { isOpen: true })
})
