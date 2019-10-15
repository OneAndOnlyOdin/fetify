import { domain } from './domain'
import { upsertLock, toLockDto, LockSchema, getLock, updateLock } from './store'
import { svcSockets } from '../../sockets/publish'

export { pop as lockPopulator }

const pop = domain.handler('lock-populator')

pop.handle('LockCreated', async (id, event, { timestamp }) => {
  const lock: LockSchema = {
    id,
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

pop.handle('CardDrawn', async (id, event, { timestamp }) => {
  const lock = await getLock(id)
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

  await updateLock(id, {
    actions: nextLock.actions,
    history: nextLock.history,
  })

  const users = [lock.ownerId, lock.playerId!].filter(Boolean)
  svcSockets.toUser(users, {
    type: 'lock-draw',
    payload: {
      card: event.card,
      action: { type: event.cardType },
      lockId: id,
      task: event.task,
    },
  })

  send(nextLock)
})

pop.handle('LockJoined', async (id, event) => {
  const lock = await getLock(id)
  if (!lock) {
    throw new Error('Lock state not found')
  }

  await updateLock(id, { playerId: event.userId })

  lock.playerId = event.userId
  send(lock)
})

pop.handle('LockCancelled', async id => {
  await updateLock(id, { isOpen: true })
  const lock = await getLock(id)
  if (!lock) return

  lock.isOpen = true
  send(lock)
})

pop.handle('LockOpened', async id => {
  await updateLock(id, { isOpen: true })

  const lock = await getLock(id)
  if (!lock) return

  lock.isOpen = true
  send(lock)
})

pop.handle('LockRenamed', async (id, event) => {
  await updateLock(id, { name: event.name })
  const lock = await getLock(id)!

  svcSockets.toUser([lock!.ownerId, lock!.playerId], {
    type: 'lock-update',
    payload: { id, update: { name: event.name } },
  })
})

pop.handle('LockDeleted', async id => {
  await updateLock(id, { deleted: true })
  const lock = await getLock(id)!

  svcSockets.toUser([lock!.ownerId, lock!.playerId], {
    type: 'lock-update',
    payload: { id, update: { deleted: true } },
  })
})

pop.handle('ActionsAdded', async (id, event, { timestamp }) => {
  const lock = await getLock(id)
  if (!lock) {
    throw new Error(`Unable to find lock "${id}" during ActionsAdded`)
  }

  lock.actions = event.actions
  const extra = Object.keys(event.config)
    .filter(key => event.config[key] > 0)
    .map(key => `${event.config[key]} ${key}s`)
    .join(', ')

  lock.history = lock.history.concat({
    type: 'actions added',
    date: timestamp,
    extra,
  })
  await updateLock(id, {
    actions: event.actions,
    history: lock.history,
  })
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
