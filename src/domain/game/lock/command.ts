import { store, repo, command } from '../../../es'
import { LockEvent, LockAgg, LockCommand, LockConfig } from './types'
import { fold, createConfigActions, play } from './util'
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
    CreateLock: async cmd => {
      validateConfig(cmd.config)

      return {
        type: 'LockCreated',
        aggregateId: cmd.aggregateId,
        ownerId: cmd.userId,
        actions: createConfigActions(cmd.config.actions),
        config: cmd.config,
      }
    },
    JoinLock: async (cmd, agg) => {
      if (agg.config.owner === 'self') {
        throw new CommandError('Lock is not joinable')
      }

      if (agg.playerId) {
        throw new CommandError('Lock already has a player')
      }

      if (cmd.userId === agg.ownerId) {
        throw new CommandError('Cannot join a lock you own')
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

      const { action, actions } = play(agg.actions, cmd.card)

      return {
        type: 'CardDrawn',
        aggregateId: cmd.aggregateId,
        card: cmd.card,
        cardType: action.type,
        actions,
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
    case 'unlock':
      return true

    case 'blank':
    case 'task':
      return elapsed - intervalMs >= 0

    case 'freeze':
      return elapsed - intervalMs * 2 >= 0
  }
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

  for (const [, amount] of Object.entries(config.actions)) {
    if (amount === undefined || isNaN(amount) || amount < 0) {
      throw new CommandError('Actions contain invalid values')
    }
  }

  if (config.actions.unlock === 0) {
    throw new CommandError('Must have at least 1 unlock')
  }

  if (
    config.actions.double > 20 ||
    config.actions.half > 20 ||
    config.actions.unlock > 20
  ) {
    throw new CommandError('Can only have up to 20 of: double, half, unlock')
  }
}
