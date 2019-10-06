import { eventHandler } from '../../es'
import { LockEvent } from './types'
import { lockCmd } from './command'
import { lockState } from './store'

export const lockMgr = eventHandler.createMongoHandler<LockEvent>({
  bookmark: 'lock-bookmark',
  eventStream: 'gameLock',
  name: 'lock-manager',
})

lockMgr.handle('LockCreated', async ({ aggregateId, event }) => {
  const joinable = event.config.owner === 'other'
  await lockState.then(tbl =>
    tbl.updateOne(
      { aggregateId },
      { $set: { aggregateId, state: 'created', joinable } },
      { upsert: true }
    )
  )
})

lockMgr.handle('LockJoined', async ({ aggregateId }) => {
  await lockState.then(tbl =>
    tbl.updateOne({ aggregateId }, { $set: { joinable: false } })
  )
})

lockMgr.handle('LockCancelled', async ({ aggregateId }) => {
  await lockState.then(tbl =>
    tbl.updateOne(
      { aggregateId },
      { $set: { state: 'resolved', joinable: false } }
    )
  )
})

lockMgr.handle('LockOpened', async ({ aggregateId }) => {
  await lockState.then(tbl =>
    tbl.updateOne(
      { aggregateId },
      { $set: { state: 'resolved', joinable: false } }
    )
  )
})

lockMgr.handle('LockDeleted', async ({ aggregateId }) => {
  await lockState.then(tbl =>
    tbl.updateOne(
      { aggregateId },
      { $set: { state: 'resolved', joinable: false } }
    )
  )
})

lockMgr.handle('CardDrawn', async ({ event }) => {
  if (event.cardType !== 'unlock') return

  await lockCmd.CompleteLock({ aggregateId: event.aggregateId })
})
