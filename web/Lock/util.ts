import { LockDomain } from '../../src/domain/game/lock'
import { createLock } from '../store/lock'
import {
  LockConfig,
  ActionAmount,
  LockAction,
} from '../../src/domain/game/lock/types'
import {
  createConfigActions,
  getRand,
  play,
} from '../../src/domain/game/lock/util'

export type Action = LockDomain.LockAction & { value: string; desc: string }

export interface CreateData {
  owner: 'self' | 'other'
  time: {
    type: LockDomain.LockConfig['time']['type']
    amount: string
    multiplier: 'hours' | 'days'
  }
  interval: {
    amount: string
    type: 'mins' | 'hours' | 'days'
  }
  actions: Action[]
  showActions: boolean
}

export function toLockConfig(data: CreateData) {
  const actions = data.actions.map(action => ({
    type: action.type,
    amount: Number(action.value),
  }))

  const cfg: LockConfig = {
    type: 'lock',
    intervalMins: Number(data.interval.amount),
    maxUsers: 1,
    owner: data.owner,
    showActions: data.showActions,
    time: { type: 'variable' },
    actions,
  }

  return cfg
}

export async function create(data: CreateData) {
  if (data.time.type === 'fixed') {
    throw new Error('Not yet supported')
  }

  const cfg = toLockConfig(data)

  return createLock(cfg)
}

export const actionOptions: Action[] = [
  { type: 'blank', value: '10', desc: 'has no effect' },
  {
    type: 'freeze',
    value: '2',
    desc: 'freezes the lock for 2x the interval',
  },
  {
    type: 'increase',
    value: '10',
    desc: 'increase the number of blanks by 1-3 ',
  },
  {
    type: 'decrease',
    value: '5',
    desc: 'decrease the number of blanks by 1-3',
  },
  { type: 'double', value: '2', desc: 'double the number of blanks' },
  { type: 'half', value: '1', desc: 'halve the number of blanks' },
  { type: 'unlock', value: '1', desc: 'collect all of these to unlock' },
  { type: 'task', value: '0', desc: 'do a task! has no other effect' },
]

export async function simulate(actions: ActionAmount[], times = 100) {
  const results: number[] = []
  let attempt = 1
  const unlocks = actions.find(a => a.type === 'unlock')
  if (!unlocks) {
    throw new Error('Invalid configuration: No unlock cards')
  }

  const cfgActions = createConfigActions(actions)

  while (attempt <= times) {
    let cards = cfgActions.slice()
    let found = 0
    let draws = 0

    while (found !== unlocks.amount) {
      draws++
      const card = getRand(0, cards.length - 1)
      const { action, actions } = play(cards, card, false)
      if (action.type === 'unlock') found++
      cards = actions
    }

    results.push(draws)

    attempt++
    await Promise.resolve()
  }

  return results
}

type Est = { [key in LockAction['type']]?: number }

export function estimate(cfg: LockConfig) {
  const est: Est = cfg.actions.reduce((prev, axn) => {
    prev[axn.type] = axn.amount
    return prev
  }, {})

  let ints = 0
  ints += zero(est.blank) + zero(est.task) + zero(est.unlock)
  ints += zero(est.increase) * 3
  ints -= zero(est.decrease) * 3
  ints += zero(est.freeze) * 2

  let blanks = zero(est.blank)
  let doubles = zero(est.double)
  let halves = zero(est.half)

  while (doubles !== 0) {
    blanks *= 2
    doubles--
  }

  while (halves !== 0) {
    blanks = Math.ceil(blanks / 2)
    halves--
  }

  ints += blanks
  ints

  return ints
}

function zero(value?: number) {
  return value || 0
}
