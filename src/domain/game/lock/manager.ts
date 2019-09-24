import { eventHandler } from '../../../es'
import { LockEvent } from './types'
import { upsertLock, LockSchema, getLock, updateLock, toLockDto } from './store'
import { svcSockets } from '../../../sockets/publish'

export const lockMgr = eventHandler.createMongoHandler<LockEvent>({
  bookmark: 'lock-bookmark',
  eventStream: 'gameLock',
  name: 'lock-manager',
})

lockMgr.handle('LockCreated', async ({ event }) => {
  const lock: LockSchema = {
    id: event.aggregateId,
    isOpen: false,
    actions: event.actions,
    config: event.config,
    ownerId: event.ownerId,
    history: [],
  }

  await upsertLock(lock)

  svcSockets.toUser(lock.ownerId, {
    type: 'lock',
    payload: toLockDto(lock),
  })
})

lockMgr.handle('CardDrawn', async ({ event, timestamp }) => {
  const lock = await getLock(event.aggregateId)
  if (!lock) {
    throw new Error('Lock state not found')
  }

  const item = { type: event.cardType, date: timestamp }
  await updateLock(event.aggregateId, {
    actions: event.actions,
    history: lock.history.concat(item),
  })
})

lockMgr.handle('LockJoined', async ({ event }) => {
  const lock = await getLock(event.aggregateId)
  if (!lock) {
    throw new Error('Lock state not found')
  }

  await updateLock(event.aggregateId, {
    playerId: event.userId,
  })
})

lockMgr.handle('LockCancelled', async ({ aggregateId }) => {
  await updateLock(aggregateId, { isOpen: true })
})

lockMgr.handle('LockOpened', async ({ aggregateId }) => {
  await updateLock(aggregateId, { isOpen: true })
})
