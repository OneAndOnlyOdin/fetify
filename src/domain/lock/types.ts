import { DomainEvent, DomainCmd } from '../util'

export type LockEvent =
  | DomainEvent<'LockCreated', { ownerId: string; config: LockConfig; actions: LockAction[] }>
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
  | DomainEvent<'ActionsAdded', { actions: LockAction[]; config: ActionConfig }>
  | DomainEvent<'IntervalUpdated', { intervalMins: number }>

export type LockCommand =
  | DomainCmd<'CreateLock', { userId: string; config: LockConfig }>
  | DomainCmd<'JoinLock', { userId: string }>
  | DomainCmd<'DrawCard', { card: number }>
  | DomainCmd<'CancelLock'>
  | DomainCmd<'CompleteLock'>
  | DomainCmd<'RenameLock', { name: string }>
  | DomainCmd<'DeleteLock'>
  | DomainCmd<'AddActions', { actions: ActionConfig }>
  | DomainCmd<'ChangeInterval', { intervalMins: number }>

export type LockCounts = { [type in ActionType]?: number }

export type LockDTO = {
  id: string
  version: number
  name?: string
  deleted?: boolean
  created: Date
  ownerId: string
  playerId?: string
  config: LockConfig
  history?: LockHistory[]
  lastHistory?: LockHistory
  historyCount: number
  counts?: LockCounts
  totalActions: number
  unlocksFound: number
  isOpen: boolean
  unlockDate?: Date
  draw?: Date
}

export type ActionAmount = { type: LockAction['type']; amount: number }

export type ActionConfig = { [type in ActionType]: number }

export type LockConfig = {
  type: 'lock'
  accumulate: boolean
  time: LockTime
  intervalMins: number
  owner: 'other' | 'self'
  maxUsers?: number
  actions: ActionConfig
  showActions: boolean
  tasks: string[]
}

export type ActionType = LockAction['type']

export type LockAction =
  | { type: 'blank' }
  | { type: 'freeze' }
  | { type: 'increase' }
  | { type: 'decrease' }
  | { type: 'unlock' }
  | { type: 'task' }
  | { type: 'reset' }
  | { type: 'double' }

export type LockTime = { type: 'fixed'; durationHrs: number } | { type: 'variable' }

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
  drawHistory: DrawHistory[]
  unlocksFound: number
}

type BaseHistory = { date: Date; extra?: any }
type HistoryType = ActionType | 'actions added'

export type LockHistory = BaseHistory & {
  type: HistoryType
}

export type HistoryActionType = ActionType | 'actions added'

export type DrawHistory = BaseHistory & { type: HistoryActionType }

export type LockMessages =
  | Msg<'lock', LockDTO>
  | Msg<'lock-draw', { lockId: string; card: number; action: LockAction; task?: string }>
  | Msg<'lock-update', { id: string; update: Partial<LockDTO> }>
