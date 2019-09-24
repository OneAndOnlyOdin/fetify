import { store, repo, command } from '../../../es'
import { LockEvent, LockAgg, LockCommand, LockConfig } from './types'
import {
  fold,
  removeAction,
  shuffle,
  applyAction,
  createConfigActions,
} from './util'
import { CommandError } from '../../../es/errors'

const writer = store.createMongoWriter('gameLock')

const lockRepo = repo.createMongoRepo<LockEvent, LockAgg>({
  eventStream: 'gameLock',
  factory: () => ({
    state: 'new',
    aggregateId: '',
    version: 0,
    config: {} as any,
    actions: [],
    drawHistory: [],
    lastDrawn: new Date(Date.now()),
    ownerId: '',
  }),
  fold,
})

export const lockCmd = command.createHandler<LockEvent, LockCommand, LockAgg>(
  {
    CreateLock: async (cmd, agg) => {
      validateConfig(cmd.config)

      return {
        type: 'LockCreated',
        aggregateId: cmd.aggregateId,
        ownerId: cmd.userId,
        actions: createConfigActions(cmd.config),
        config: agg.config,
      }
    },
    JoinLock: async (cmd, agg) => {
      if (agg.playerId) {
        throw new CommandError('Lock already has a player')
      }

      return {
        type: 'LockJoined',
        aggregateId: cmd.aggregateId,
        userId: cmd.userId,
      }
    },
    DrawCard: async (cmd, agg) => {
      if (!canDraw(agg)) {
        throw new CommandError('Cannot draw yet')
      }

      const exists = agg.actions[cmd.card] !== undefined
      if (!exists) {
        throw new CommandError('Card out of bounds')
      }

      const { action, actions } = removeAction(agg.actions, cmd.card)
      const nextActions = applyAction(action, actions)

      return {
        type: 'CardDrawn',
        aggregateId: cmd.aggregateId,
        card: cmd.card,
        cardType: action.type,
        actions: shuffle(nextActions),
      }
    },
    CompleteLock: async (cmd, agg) => {
      if (agg.state === 'opened') {
        throw new CommandError('Lock already open')
      }

      return { type: 'LockOpened', aggregateId: cmd.aggregateId }
    },
    CancelLock: async (cmd, agg) => {
      if (agg.state === 'opened') {
        throw new CommandError('Lock already open')
      }

      return { type: 'LockCancelled', aggregateId: cmd.aggregateId }
    },
  },
  lockRepo,
  writer
)

function canDraw(agg: LockAgg): boolean {
  const last = agg.drawHistory.slice(-1)[0]
  if (!last) return true
  const time = last.date
  const elapsed = Date.now() - time.valueOf()
  const intervalMs = agg.config.intervalMins * 60 * 1000

  switch (last.type) {
    case 'decrease':
    case 'increase':
    case 'double':
    case 'half':
      return true

    case 'blank':
    case 'task':
      return elapsed - intervalMs >= 0

    case 'freeze':
      return elapsed - intervalMs * 2 >= 0
  }

  return false
}

function validateConfig(config: LockConfig) {
  if (config.time.type !== 'variable') {
    throw new CommandError('Only variable is supported')
  }

  if (config.owner !== 'self' && config.owner !== 'other') {
    throw new CommandError('Unrecognized owner')
  }

  if (isNaN(config.intervalMins) || config.intervalMins < 0) {
    throw new CommandError('intervalMins is not a valid number above zero')
  }

  for (const action of config.actions) {
    if (isNaN(action.amount) || action.amount < 0) {
      throw new CommandError('Actions contain invalid values')
    }
  }
}
