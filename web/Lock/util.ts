import { LockDomain } from '../../src/domain/game/lock'
import { createLock } from '../store/lock'
import { LockConfig } from '../../src/domain/game/lock/types'

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
