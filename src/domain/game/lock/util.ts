import { StoredEvent } from '../../../es'
import {
  LockEvent,
  LockAgg,
  LockAction,
  LockConfig,
  LockHistory,
  ActionType,
} from './types'

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
  double: {
    value: 2,
    desc: 'double the number of BLANK and INCREASE cards',
    max: 20,
  },
  half: {
    value: 1,
    desc: 'halve the number of BLANK and increase cards',
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

type Opts = {
  history: LockHistory[]
  config: LockConfig
  since?: Date
}

export function secondsTilDraw(opts: Opts): number {
  const action = opts.history.slice(-1)[0]
  if (!action) return 0

  const factor = action.type === 'freeze' ? 2 : 1
  const interval = opts.config.intervalMins * 60 * factor
  const elapsed = Math.floor(
    (Date.now() - new Date(action.date).valueOf()) * 0.001
  )
  const diff = interval - elapsed

  switch (action.type) {
    case 'freeze':
    case 'blank':
    case 'task':
      return diff <= 0 ? 0 : diff

    case 'decrease':
    case 'increase':
    case 'double':
    case 'half':
    case 'unlock':
      return 0
  }
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

export function play(
  playActions: LockAction[],
  card: number,
  shuffleCards = true
) {
  const { action, actions } = removeAction(playActions, card)
  const nextActions = applyAction(action, actions)

  if (shuffleCards && shuffleActions.includes(action.type)) {
    shuffle(nextActions)
  }

  return {
    actions: nextActions,
    action,
  }
}

function applyAction(action: LockAction, actions: LockAction[]) {
  switch (action.type) {
    case 'blank':
    case 'freeze':
    case 'task':
    case 'unlock':
      break

    case 'decrease': {
      const amount = getRand(1, 3)
      return removeActions(actions, amount, 'blank')
    }

    case 'increase': {
      return actions.concat(createActions(getRand(1, 3)))
    }

    case 'double': {
      const blanks = actions.reduce(countBlanks, 0)
      const increases = actions.reduce(countIncreases, 0)

      return actions.concat(
        ...createActions(blanks, 'unlock'),
        ...createActions(increases, 'increase')
      )
    }

    case 'half': {
      const blanks = Math.floor(actions.reduce(countBlanks, 0) / 2)
      const increases = Math.floor(actions.reduce(countIncreases, 0) / 2)

      if (blanks > 0) removeActions(actions, blanks, 'blank')
      if (increases > 0) removeActions(actions, increases, 'increase')

      return actions
    }
  }

  return actions
}

const countBlanks = (count: number, action: LockAction) =>
  action.type === 'blank' ? count + 1 : count
const countIncreases = (count: number, action: LockAction) =>
  action.type === 'increase' ? count + 1 : count

export function removeAction(actions: LockAction[], index: number) {
  const action = actions.splice(index, 1)[0]
  return { action, actions }
}

export function getRand(min: number, max: number) {
  const diff = max - min + 1
  const rand = Math.floor(Math.random() * diff)

  return rand + min
}

function removeActions(
  actions: LockAction[],
  amount: number,
  type: ActionType
) {
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

export function isValidType(type: ActionType): boolean {
  switch (type) {
    case 'blank':
    case 'decrease':
    case 'double':
    case 'freeze':
    case 'half':
    case 'increase':
    case 'task':
    case 'unlock':
      return true
  }

  throwNever(type)
  return false
}

function throwNever(_nv: never) {}

export function createActions(
  amount: number,
  type: LockAction['type'] = 'blank'
): LockAction[] {
  return Array.from({ length: amount }, () => ({ type }))
}

export function createConfigActions(cfgActions: LockConfig['actions']) {
  const actions: LockAction[] = []

  for (const [type, amount] of Object.entries(cfgActions)) {
    if (!amount) continue
    const newActions = createActions(amount, type as ActionType)
    actions.push(...newActions)
  }

  return shuffle(actions)
}

const shuffleActions: LockAction['type'][] = [
  'increase',
  'decrease',
  'double',
  'half',
]

export function shuffle(actions: LockAction[]) {
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
