import { StoredEvent } from '../../es'
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
      return next

    case 'LockRenamed':
      next.name = event.name
      return next

    case 'LockDeleted':
      next.state = 'deleted'
      return next

    case 'LockCancelled':
    case 'LockOpened':
      next.state = 'opened'
      return next

    case 'CardDrawn':
      if (event.cardType === 'unlock') next.unlocksFound++
      if (event.cardType === 'reset') next.unlocksFound = 0

      next.actions = event.actions
      next.drawHistory = agg.drawHistory.concat({
        type: event.cardType,
        date: timestamp,
      })
      return next

    case 'LockJoined':
      next.ownerId = event.userId
      return next

    case 'ActionsAdded':
      next.actions = event.actions
      return next
  }
}
