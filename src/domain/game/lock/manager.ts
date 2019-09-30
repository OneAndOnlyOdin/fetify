import { eventHandler } from '../../../es'
import { LockEvent } from './types'
import { lockCmd } from './command'

export const lockMgr = eventHandler.createMongoHandler<LockEvent>({
  bookmark: 'lock-bookmark',
  eventStream: 'gameLock',
  name: 'lock-manager',
})

lockMgr.handle('CardDrawn', async ({ event }) => {
  if (event.cardType !== 'unlock') return

  await lockCmd.CompleteLock({ aggregateId: event.aggregateId })
})
