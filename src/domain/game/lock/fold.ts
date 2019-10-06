import { StoredEvent } from '../../../es'
import { LockEvent, LockAgg } from './types'

export function fold(
  { event, timestamp }: StoredEvent<LockEvent>,
  agg: LockAgg
): LockAgg {
  const next = { ...agg }

  switch (event.type) {
    case 'LockCreated':
      next.actions = event.actions
      next.ownerId = event.ownerId
      next.config = event.config
      next.state = 'created'
      next.created = timestamp
      break

    case 'LockRenamed':
      next.name = event.name
      break

    case 'LockDeleted':
      next.state = 'deleted'
      break

    case 'LockCancelled':
    case 'LockOpened':
      next.state = 'opened'
      break

    case 'CardDrawn':
      if (event.cardType === 'unlock') next.unlocksFound++
      if (event.cardType === 'reset') next.unlocksFound = 0

      next.actions = event.actions
      next.drawHistory = agg.drawHistory.concat({
        type: event.cardType,
        date: timestamp,
      })
      break

    case 'LockJoined':
      next.ownerId = event.userId
      break
  }

  return next
}
