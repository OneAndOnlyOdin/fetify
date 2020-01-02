import { LockAction, LockConfig, LockHistory, ActionType, DrawHistory, LockAgg } from './types'

export const defaultTask = 'Perform a task for the key holder!'

export const actionOptions: {
  [type in ActionType]: { value: number; desc: string; max?: number }
} = {
  blank: { value: 10, desc: 'the lock is frozen for the interval', max: 365 },
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
    case 'unlock':
    case 'reset':
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

export function play(lock: LockAgg, card: number) {
  const action = lock.actions[card]
  const nextActions = applyAction(lock, action)

  return {
    actions: shuffle(nextActions),
    action,
  }
}

function applyAction({ actions, config, drawHistory }: LockAgg, action: LockAction): LockAction[] {
  const resets = config.actions.reset - drawHistory.filter(card => card.type === 'reset').length
  const nextActions = actions.filter(card => card.type !== 'reset').concat(createActions(resets, 'reset'))

  switch (action.type) {
    case 'blank':
    case 'freeze':
    case 'task':
    case 'unlock':
      return nextActions

    case 'decrease': {
      return removeActions(nextActions, 1, 'blank')
    }

    case 'increase': {
      return nextActions.concat(createActions(getRand(1, 3)))
    }

    case 'reset': {
      // const resetsFound = drawHistory.filter(card => card.type === 'reset').length
      // const resetsLeft = config.actions.reset - resetsFound
      // const resets = createActions(resetsLeft, 'reset')
      // const nextActions = createConfigActions({
      //   ...config.actions,
      //   reset: 0,
      // }).concat(resets)

      return nextActions
    }
  }
}

export function getRand(min: number, max: number) {
  const diff = max - min + 1
  const rand = Math.floor(Math.random() * diff)

  return rand + min
}

function removeActions(actions: LockAction[], amount: number, type: ActionType) {
  let removed = 0

  for (let i = 0; i < actions.length; i++) {
    if (removed === amount) break
    if (actions[i].type === type) {
      removed++
      actions.splice(i, 1)
      i--
    }
  }

  return actions
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
      return true
  }

  throwNever(type)
}

function throwNever(nv: never) {
  throw new Error(`Unexpected type: ${nv}`)
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
