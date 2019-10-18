import { createDomain, EventMeta } from 'evtstore'
import { LockEvent, LockAgg, LockCommand } from './types'
import { getProvider } from '../util'
import { command } from './command'

export const domain = createDomain<LockEvent, LockAgg, LockCommand>(
  {
    stream: 'gameLock',
    provider: getProvider<LockEvent>(),
    aggregate: () => ({
      state: 'new',
      created: new Date(0),
      aggregateId: '',
      version: 0,
      config: {} as any,
      actions: [],
      drawHistory: [],
      lastDrawn: new Date(Date.now()),
      ownerId: '',
      accumulate: false,
      unlocksFound: 0,
    }),
    fold,
  },
  command
)

function fold(ev: LockEvent, agg: LockAgg, meta: EventMeta): Partial<LockAgg> {
  switch (ev.type) {
    case 'LockCreated':
      return {
        state: 'created',
        actions: ev.actions,
        ownerId: ev.ownerId,
        config: ev.config,
      }

    case 'LockRenamed':
      return { name: ev.name }

    case 'LockDeleted':
      return { state: 'deleted' }

    case 'LockCancelled':
    case 'LockOpened':
      return { state: 'opened' }

    case 'CardDrawn':
      let unlocksFound = agg.unlocksFound
      if (ev.cardType === 'unlock') unlocksFound++
      if (ev.cardType === 'reset') unlocksFound = 0

      return {
        unlocksFound,
        actions: ev.actions,
        drawHistory: agg.drawHistory.concat({
          type: ev.cardType,
          date: meta.timestamp,
        }),
      }

    case 'LockJoined':
      return { playerId: ev.userId }

    case 'ActionsAdded':
      return { actions: ev.actions }
  }
}
