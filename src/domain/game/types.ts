import { DomainEvent, DomainCmd } from '../../es'

export type GameEvent =
  | DomainEvent<'GameCreated', { userId: string; config: GameConfig }>
  | DomainEvent<'GameJoined', { userId: string }>
  | DomainEvent<'GameUpdated', { config: Partial<GameConfig> }>
  | DomainEvent<'GameComplete'>
  | DomainEvent<'GameCancelled'>

export type GameCommand =
  | DomainCmd<'CreateGame', { userId: string; config: GameConfig }>
  | DomainCmd<'JoinGame', { userId: string }>
  | DomainCmd<'UpdateGame', { config: Partial<GameConfig> }>
  | DomainCmd<'CancelGame'>
  | DomainCmd<'CompleteGame'>

export type GameConfig = LockConfig

export type LockConfig = {
  type: 'lock'
  time: LockTime
  intervalMins: number
  owner: 'other' | 'self'
  maxUsers?: number
  actions: Array<{ action: LockAction; amount: number }>
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
