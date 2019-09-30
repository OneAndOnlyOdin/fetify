import { LockDomain } from '../../src/domain/game/lock'
import { createLock, ClientLock } from '../store/lock'
import { LockConfig, LockHistory } from '../../src/domain/game/lock/types'
import { getDrawCount, actionOptions } from '../../src/domain/game/lock/util'
import { common } from '../common'

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
  actions: typeof actionOptions
  showActions: boolean
}

export function getLockDraws(lock: ClientLock) {
  if (!lock) return 0
  return getDrawCount({
    created: new Date(lock.created),
    history: lock.history,
    intervalMins: lock.config.intervalMins,
  })
}

export function toLockConfig(data: CreateData) {
  const actions: LockConfig['actions'] = {
    blank: zero(data.actions.blank.value) / 2,
    decrease: zero(data.actions.decrease.value) / 2,
    increase: zero(data.actions.increase.value) / 2,
    double: zero(data.actions.double.value) / 2,
    half: zero(data.actions.half.value),
    freeze: zero(data.actions.freeze.value),
    task: zero(data.actions.task.value),
    unlock: zero(data.actions.unlock.value),
  }

  const cfg: LockConfig = {
    type: 'lock',
    accumulate: false,
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

export function estimate(cfg: LockConfig) {
  const actions = cfg.actions
  const secs = cfg.intervalMins * 60

  let draws = 0
  draws += actions.blank + actions.task + actions.unlock
  draws += actions.increase * 3
  draws -= actions.decrease * 3
  draws += actions.freeze * 2

  let blanks = actions.blank
  let doubles = actions.double
  let halves = actions.half

  while (doubles > 0) {
    blanks *= 2
    doubles--
  }

  while (halves > 0) {
    blanks = Math.ceil(blanks / 2)
    halves--
  }

  draws += blanks

  return { avg: draws * secs * 0.5, worst: draws * secs }
}

function zero(value?: number): number {
  if (value && value < 0) return 0
  return value || 0
}

export function mapHistory(history: LockHistory[]) {
  return history.sort(sortHistory).map(hist => ({
    ...hist,
    since: common.elapsedSince(hist.date),
  }))
}

function sortHistory(l: LockHistory, r: LockHistory) {
  return l.date > r.date ? -1 : l.date === r.date ? 0 : 1
}
