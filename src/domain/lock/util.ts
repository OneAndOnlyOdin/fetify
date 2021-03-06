import { LockAction, LockConfig, LockHistory, ActionType, DrawHistory, LockAgg } from './types'

const MAX_BLANKS = 365

export const defaultTask = 'Perform a task for the key holder!'

export const actionOptions: {
  [type in ActionType]: { value: number; desc: string; max: number }
} = {
  blank: { value: 10, desc: 'the lock is frozen for the interval', max: MAX_BLANKS },
  decrease: {
    value: 10,
    desc: 'decrease the number of BLANK cards by 1-3',
    max: 100,
  },
  increase: {
    value: 10,
    desc: 'increase the number of BLANK cards by 1-3',
    max: 100,
  },
  reset: {
    value: 0,
    desc: 'reset the lock to the starting state (does not reset "reset" cards)',
    max: 20,
  },
  freeze: { value: 2, desc: 'freezes the lock for 2x the interval', max: 100 },
  task: {
    value: 0,
    desc: 'do a task! the lock is also frozen for the interval',
    max: 100,
  },
  double: {
    value: 0,
    desc: `double the number of blanks! blanks cannot exceed ${MAX_BLANKS}`,
    max: 20,
  },
  unlock: { value: 1, desc: 'collect all of these to unlock', max: 20 },
}

type Opts = {
  history: LockHistory[]
  config: LockConfig
  since?: Date
}

export function secondsTilDraw(opts: Opts): number {
  const history = filterLockActions(opts.history)
  const action = history.slice(-1)[0]
  if (!action) return 0

  const factor = action.type === 'freeze' ? 2 : 1
  const interval = opts.config.intervalMins * 60 * factor
  const elapsed = Math.floor((Date.now() - new Date(action.date).valueOf()) * 0.001)
  const diff = interval - elapsed

  switch (action.type) {
    case 'freeze':
    case 'blank':
    case 'task':
      return diff <= 0 ? 0 : diff

    case 'decrease':
    case 'increase':
    case 'double':
    case 'unlock':
    case 'reset':
    case 'actions added':
      return 0
  }
}

export function filterLockActions(history: LockHistory[]): DrawHistory[] {
  return history.filter(history => isValidType(history.type as any)) as DrawHistory[]
}

type DrawCountOpts = {
  history: LockHistory[]
  created: Date
  since?: Date
  intervalMins: number
}

export function getDrawCount(opts: DrawCountOpts) {
  const now = opts.since ? opts.since.valueOf() : Date.now()
  const diff = (now - opts.created.valueOf()) * 0.001

  let chances = Math.floor(diff / (opts.intervalMins * 60))

  for (const hist of opts.history) {
    switch (hist.type) {
      case 'blank':
      case 'task':
        chances--
        break

      case 'freeze':
        chances -= 2
        break
    }
  }

  return chances
}

export function play(lock: LockAgg, card: number): { actions: LockAction[]; action: LockAction } {
  const action = lock.actions[card]
  const nextActions = applyAction(lock, action)

  switch (action.type) {
    case 'task':
    case 'blank':
    case 'freeze': {
      return {
        actions: nextActions,
        action,
      }
    }

    case 'double':
    case 'decrease':
    case 'increase':
    case 'unlock':
    case 'reset': {
      return {
        actions: shuffle(nextActions),
        action,
      }
    }
  }
}

function applyAction({ actions, config, drawHistory }: LockAgg, action: LockAction): LockAction[] {
  switch (action.type) {
    case 'freeze':
    case 'blank':
    case 'task': {
      return removeActions(actions, 1, action.type)
    }

    case 'decrease': {
      return removeActions(removeActions(actions, 1, 'decrease'), getRand(1, 3), 'blank')
    }

    case 'increase': {
      const nextActions = addActions(actions, getRand(1, 3), 'blank')
      return removeActions(nextActions, 1, 'increase')
    }

    case 'double': {
      const blanks = countActions(actions, 'blank')
      const nextActions = addActions(actions, blanks, 'blank')
      return removeActions(nextActions, 1, 'double')
    }

    case 'unlock':
    case 'reset': {
      const resetsFound = countActions(drawHistory, 'reset')
      const resetsLeft = config.actions.reset - resetsFound
      const nextActions = createConfigActions({
        ...config.actions,
        reset: resetsLeft,
      })

      return nextActions
    }
  }
}

export function getRand(min: number, max: number) {
  const diff = max - min + 1
  const rand = Math.floor(Math.random() * diff)

  return rand + min
}

function removeActions(actions: LockAction[], amount: number, ...types: ActionType[]) {
  for (const type of types) {
    let removed = 0
    for (let i = 0; i < actions.length; i++) {
      if (removed === amount) break
      if (actions[i].type === type) {
        removed++
        actions.splice(i, 1)
        i--
      }
    }
  }

  return actions
}

function countActions<T extends { type: string }>(actions: T[], type: ActionType = 'blank') {
  let count = 0
  for (const action of actions) {
    if (action.type === type) count++
  }
  return count
}

export function toActionConfig(cfg: { [key: string]: number }): LockConfig['actions'] {
  return {
    blank: min(cfg.blank),
    decrease: min(cfg.decrease),
    increase: min(cfg.increase),
    freeze: min(cfg.freeze),
    task: min(cfg.task),
    reset: min(cfg.reset),
    unlock: min(cfg.unlock),
    double: min(cfg.double),
  }
}

export function isValidType(type: ActionType): boolean {
  switch (type) {
    case 'blank':
    case 'decrease':
    case 'freeze':
    case 'increase':
    case 'task':
    case 'unlock':
    case 'reset':
    case 'double':
      return true
  }

  throwNever(type)
}

function throwNever(_nv: never) {
  return false
}

export function addActions(actions: LockAction[], add: number, type: ActionType = 'blank') {
  const max = actionOptions[type].max
  const count = countActions(actions, type)

  let toAdd = add
  if (add + count > max) toAdd = max - count

  return actions.concat(createActions(toAdd, type))
}

export function createActions(amount: number, type: ActionType = 'blank'): LockAction[] {
  if (type === 'unlock') {
    return [{ type }]
  }

  return Array.from({ length: amount }, () => ({ type }))
}

export function createConfigActions(cfgActions: LockConfig['actions']) {
  const actions: LockAction[] = []

  for (const [type, amount] of Object.entries(cfgActions)) {
    if (!amount) continue
    const newActions = createActions(amount, type as ActionType)
    actions.push(...newActions)
  }

  return actions
}

export function shuffle(actions: LockAction[]): LockAction[] {
  const seeded = actions.map(addSeed)
  const sorted = seeded.sort(bySeed).map(removeSeed)
  return sorted
}

function addSeed(action: LockAction) {
  return { ...action, seed: Math.random() }
}

function removeSeed(action: LockAction) {
  return { ...action, seed: undefined }
}

function bySeed(left: any, right: any) {
  return left.seed > right.seed ? 1 : left.seed === right.seed ? 0 : -1
}

function min(value: any, min = 0) {
  const num = Number(value)
  return num >= min ? num : min
}
