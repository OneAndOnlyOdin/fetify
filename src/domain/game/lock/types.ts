import { DomainEvent, DomainCmd } from '../../../es'

export type LockEvent =
  | DomainEvent<
      'LockCreated',
      { ownerId: string; config: LockConfig; actions: LockAction[] }
    >
  | DomainEvent<'LockJoined', { userId: string }>
  | DomainEvent<
      'CardDrawn',
      {
        card: number
        cardType: LockAction['type']
        actions: LockAction[]
        task?: string
      }
    >
  | DomainEvent<'LockOpened'>
  | DomainEvent<'LockCancelled'>
  | DomainEvent<'LockRenamed', { name: string }>
  | DomainEvent<'LockDeleted'>
  | DomainEvent<'ActionsAdded', { actions: LockAction[] }>

export type LockCommand =
  | DomainCmd<'CreateLock', { userId: string; config: LockConfig }>
  | DomainCmd<'JoinLock', { userId: string }>
  | DomainCmd<'DrawCard', { card: number }>
  | DomainCmd<'CancelLock'>
  | DomainCmd<'CompleteLock'>
  | DomainCmd<'RenameLock', { name: string }>
  | DomainCmd<'DeleteLock'>
  | DomainCmd<'AddActions', { actions: ActionAmount[] }>

export type ActionAmount = { type: LockAction['type']; amount: number }

export type LockConfig = {
  type: 'lock'
  accumulate: boolean
  time: LockTime
  intervalMins: number
  owner: 'other' | 'self'
  maxUsers?: number
  actions: { [type in ActionType]: number }
  showActions: boolean
  tasks: string[]
}

export type ActionType = LockAction['type']

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
  state: 'new' | 'created' | 'opened' | 'deleted'
  name?: string
  created: Date
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
  extra?: any
}
