import { DomainEvent, DomainCmd } from '../../../es'

export type LockEvent =
  | DomainEvent<
      'LockCreated',
      { ownerId: string; config: LockConfig; actions: LockAction[] }
    >
  | DomainEvent<'LockJoined', { userId: string }>
  | DomainEvent<
      'CardDrawn',
      { card: number; cardType: LockAction['type']; actions: LockAction[] }
    >
  | DomainEvent<'LockOpened'>
  | DomainEvent<'LockCancelled'>

export type LockCommand =
  | DomainCmd<'CreateLock', { userId: string; config: LockConfig }>
  | DomainCmd<'JoinLock', { userId: string }>
  | DomainCmd<'DrawCard', { card: number }>
  | DomainCmd<'CancelLock'>
  | DomainCmd<'CompleteLock'>

export type ActionAmount = { type: LockAction['type']; amount: number }

export type LockConfig = {
  type: 'lock'
  time: LockTime
  intervalMins: number
  owner: 'other' | 'self'
  maxUsers?: number
  actions: ActionAmount[]
  showActions: boolean
}

export type LockAction =
  | { type: 'blank' }
  | { type: 'freeze' }
  | { type: 'increase' }
  | { type: 'decrease' }
  | { type: 'double' }
  | { type: 'half' }
  | { type: 'unlock' }
  | { type: 'task' }

export type LockTime =
  | { type: 'fixed'; durationHrs: number }
  | { type: 'variable' }

export type LockAgg = {
  state: 'new' | 'created' | 'opened'
  aggregateId: string
  ownerId: string
  playerId?: string
  version: number
  config: LockConfig
  actions: LockAction[]
  lastDrawn: Date
  drawHistory: LockHistory[]
}

export type LockHistory = {
  type: LockAction['type']
  date: Date
}
