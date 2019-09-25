import { LockDomain } from '../../src/domain/game/lock'
import { createLock, ClientLock } from '../store/lock'
import { LockConfig } from '../../src/domain/game/lock/types'

export type Action = LockDomain.LockAction & { value: string; desc: string }

export interface CreateData {
  loading: boolean
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

export async function create(data: CreateData) {
  if (data.time.type === 'fixed') {
    throw new Error('Not yet supported')
  }

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

  return createLock(cfg)
}

export function nextLockDraw(lock: ClientLock) {
  return toDuration(lock.drawSeconds)
}

const ONE_HOUR = 3600
const ONE_DAY = 86400

type Duration = [number, number, number, number]

function toDuration(value: number) {
  const days = Math.floor(value / ONE_DAY)
  const hours = Math.floor(value / ONE_HOUR) % 24
  const mins = Math.floor(value / 60) % 60
  const secs = value % 60

  return {
    duration: [days, hours, mins, secs] as Duration,
    seconds: value,
    text:
      value <= 0
        ? 'now'
        : `${days}d:${hours}h:${mins}m:${secs}s`.replace('0d:', ''),
  }
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
