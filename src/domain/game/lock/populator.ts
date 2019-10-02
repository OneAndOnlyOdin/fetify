import { eventHandler } from '../../../es'
import { LockEvent } from './types'
import { upsertLock, toLockDto, LockSchema, getLock, updateLock } from './store'
import { svcSockets } from '../../../sockets/publish'

export { pop as lockPopulator }

const pop = eventHandler.createMongoHandler<LockEvent>({
  bookmark: 'lock-populator',
  eventStream: 'gameLock',
  name: 'lock-populator',
})

pop.handle('LockCreated', async ({ event, timestamp }) => {
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
  send(lock)
})

pop.handle('CardDrawn', async ({ event, timestamp }) => {
  const lock = await getLock(event.aggregateId)
  if (!lock) {
    throw new Error('Lock state not found')
  }

  let extra: any

  switch (event.cardType) {
    case 'task':
      extra = event.task
      break
  }

  const item = { type: event.cardType, date: timestamp, extra }
  const nextLock = {
    ...lock,
    actions: event.actions,
    history: lock.history.concat(item),
  }

  await updateLock(event.aggregateId, {
    actions: nextLock.actions,
    history: nextLock.history,
  })

  const users = [lock.ownerId, lock.playerId!].filter(Boolean)
  svcSockets.toUser(users, {
    type: 'lock-draw',
    payload: {
      card: event.card,
      action: { type: event.cardType },
      lockId: event.aggregateId,
      task: event.task,
    },
  })

  send(nextLock)
})

pop.handle('LockJoined', async ({ event }) => {
  const lock = await getLock(event.aggregateId)
  if (!lock) {
    throw new Error('Lock state not found')
  }

  await updateLock(event.aggregateId, {
    playerId: event.userId,
  })

  lock.playerId = event.userId
  send(lock)
})

pop.handle('LockCancelled', async ({ aggregateId }) => {
  await updateLock(aggregateId, { isOpen: true })
  const lock = await getLock(aggregateId)
  if (!lock) return

  lock.isOpen = true
  send(lock)
})

pop.handle('LockOpened', async ({ aggregateId }) => {
  await updateLock(aggregateId, { isOpen: true })

  const lock = await getLock(aggregateId)
  if (!lock) return

  lock.isOpen = true
  send(lock)
})

function send(lock: LockSchema) {
  svcSockets.toUser(lock.ownerId, {
    type: 'lock',
    payload: toLockDto(lock, lock.ownerId),
  })

  if (lock.playerId) {
    svcSockets.toUser(lock.playerId, {
      type: 'lock',
      payload: toLockDto(lock, lock.playerId),
    })
  }
}
