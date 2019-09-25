import { StoredEvent } from '../../../es'
import {
  LockEvent,
  LockAgg,
  LockAction,
  LockConfig,
  LockHistory,
} from './types'

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

export function applyAction(action: LockAction, actions: LockAction[]) {
  switch (action.type) {
    case 'blank':
    case 'freeze':
    case 'task':
    case 'unlock':
      break

    case 'decrease': {
      const amount = getRand(1, 3)
      return removeBlanks(amount, actions)
    }

    case 'increase': {
      return actions.concat(createActions(getRand(1, 3)))
    }

    case 'double': {
      const amount = actions.filter(action => action.type === 'blank').length
      return actions.concat(createActions(amount * 2))
    }

    case 'half': {
      const amount =
        actions.filter(action => action.type === 'blank').length / 2
      if (amount === 0) break
      if (amount === 1) return removeBlanks(1, actions)
      return removeBlanks(Math.floor(amount / 2), actions)
    }
  }

  return actions
}

export function removeAction(actions: LockAction[], index: number) {
  const action = actions[index]
  const nextActions = actions.filter((_, i) => i !== index)
  return { action, actions: nextActions }
}

function getRand(min: number, max: number) {
  const diff = max - min + 1
  const rand = Math.floor(Math.random() * diff)

  return rand + min
}

function removeBlanks(amount: number, actions: LockAction[]) {
  let removed = 0

  const nextActions = actions.filter(action => {
    if (removed === amount) return true
    if (action.type !== 'blank') return true

    removed++
    return false
  })

  return nextActions
}

function createActions(
  amount: number,
  type: LockAction['type'] = 'blank'
): LockAction[] {
  return Array.from({ length: amount }, () => ({ type }))
}

export function shuffle(actions: LockAction[]) {
  const seeded = actions.map(action => ({ ...action, seed: Math.random() }))
  const sorted = seeded
    .sort((left, right) =>
      left.seed > right.seed ? 1 : left.seed === right.seed ? 0 : -1
    )
    .map(action => ({ ...action, seed: undefined }))
  return sorted
}

export function createConfigActions(config: LockConfig) {
  const actions: LockAction[] = []

  for (const action of config.actions) {
    const newActions = createActions(action.amount, action.type)
    actions.push(...newActions)
  }

  return shuffle(actions)
}
