import { LockEvent, LockAgg, LockCommand, LockConfig } from './types'
import {
  createConfigActions,
  play,
  getDrawCount,
  getRand,
  defaultTask,
  shuffle,
  toActionConfig,
  filterLockActions,
} from './util'
import { CommandHandler, CommandError } from 'evtstore'

export const command: CommandHandler<LockEvent, LockAgg, LockCommand> = {
  CreateLock: async cmd => {
    validateConfig(cmd.config)
    const actions = toActionConfig(cmd.config.actions)

    return {
      type: 'LockCreated',
      aggregateId: cmd.aggregateId,
      ownerId: cmd.userId,
      actions: shuffle(createConfigActions(actions)),
      config: cmd.config,
    }
  },
  JoinLock: async (cmd, agg) => {
    if (agg.version === 0) throw new CommandError('Lock does not exist')
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
    if (agg.state === 'opened') return
    if (!canDraw(agg)) {
      throw new CommandError('Cannot draw yet', 'CANNOT_DRAW')
    }

    const exists = agg.actions[cmd.card] !== undefined
    if (!exists) {
      throw new CommandError('Card out of bounds')
    }

    const { action, actions } = play(agg, cmd.card)

    let task: string | undefined

    if (action.type === 'task') {
      const rand = getRand(0, agg.config.tasks.length - 1)
      task = agg.config.tasks[rand] || defaultTask
    }

    return {
      type: 'CardDrawn',
      aggregateId: cmd.aggregateId,
      card: cmd.card,
      cardType: action.type,
      actions,
      task,
    }
  },
  CompleteLock: async (cmd, agg) => {
    if (agg.state === 'opened') return
    if (agg.config.actions.unlock !== agg.unlocksFound) return

    return { type: 'LockOpened', aggregateId: cmd.aggregateId }
  },
  CancelLock: async (cmd, agg) => {
    if (agg.state === 'opened') return

    return { type: 'LockCancelled', aggregateId: cmd.aggregateId }
  },
  RenameLock: async cmd => {
    return {
      type: 'LockRenamed',
      aggregateId: cmd.aggregateId,
      name: cmd.name,
    }
  },
  DeleteLock: async (cmd, agg) => {
    if (agg.state === 'deleted') return
    return { type: 'LockDeleted', aggregateId: cmd.aggregateId }
  },
  AddActions: async (cmd, agg) => {
    if (agg.state !== 'created') throw new CommandError('Lock not active', 'NOT_ACTIVE')

    const cfg = toActionConfig(cmd.actions)
    const newActions = createConfigActions(cfg)
    const actions = newActions.concat(agg.actions)

    return {
      type: 'ActionsAdded',
      aggregateId: cmd.aggregateId,
      actions: shuffle(actions),
      config: cfg,
    }
  },
  ChangeInterval: async (cmd, agg) => {
    if (agg.state !== 'created') throw new CommandError('Lock not active', 'NOT_ACTIVE')
    const intervalMins = Number(cmd.intervalMins)

    if (isNaN(intervalMins)) throw new CommandError('Interval is not a valid number')
    if (intervalMins < 0) throw new CommandError('Interval cannot be negative', 'INVALID_INTERVAL')

    return {
      type: 'IntervalUpdated',
      intervalMins,
    }
  },
}

function canDraw(agg: LockAgg): boolean {
  if (agg.config.accumulate) {
    const chances = getDrawCount({
      intervalMins: agg.config.intervalMins,
      history: agg.drawHistory,
      created: agg.created,
    })

    return chances > 0
  }

  const history = filterLockActions(agg.drawHistory)
  const last = history.slice(-1)[0]
  if (!last) return true

  const time = last.date
  const elapsed = Date.now() - time.valueOf()
  const intervalMs = agg.config.intervalMins * 60 * 1000

  switch (last.type) {
    case 'decrease':
    case 'increase':
    case 'unlock':
    case 'reset':
    case 'double':
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

  if (config.actions.unlock > 20) {
    throw new CommandError('Can only have up to 20 of: double, half, unlock')
  }

  config.tasks = config.tasks.filter(task => {
    if (typeof task !== 'string') return false
    if (task.trim().length === 0) return false
    return true
  })
}
