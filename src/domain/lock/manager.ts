import { domain } from './domain'
import { lockState } from './store'

export const lockMgr = domain.handler('lock-bookmark')

lockMgr.handle('LockCreated', async (aggregateId, event) => {
  const joinable = event.config.owner === 'other'
  await lockState.then(tbl =>
    tbl.updateOne(
      { aggregateId },
      { $set: { aggregateId, state: 'created', joinable } },
      { upsert: true }
    )
  )
})

lockMgr.handle('LockJoined', async aggregateId => {
  await lockState.then(tbl =>
    tbl.updateOne({ aggregateId }, { $set: { joinable: false } })
  )
})

lockMgr.handle('LockCancelled', async aggregateId => {
  await lockState.then(tbl =>
    tbl.updateOne(
      { aggregateId },
      { $set: { state: 'resolved', joinable: false } }
    )
  )
})

lockMgr.handle('LockOpened', async aggregateId => {
  await lockState.then(tbl =>
    tbl.updateOne(
      { aggregateId },
      { $set: { state: 'resolved', joinable: false } }
    )
  )
})

lockMgr.handle('LockDeleted', async aggregateId => {
  await lockState.then(tbl =>
    tbl.updateOne(
      { aggregateId },
      { $set: { state: 'resolved', joinable: false } }
    )
  )
})

lockMgr.handle('CardDrawn', async (aggregateId, event) => {
  if (event.cardType !== 'unlock') return

  await domain.command.CompleteLock(aggregateId, {})
})
