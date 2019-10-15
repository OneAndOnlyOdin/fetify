import { DomainEvent, DomainCmd } from '../util'

export type InviteType = 'lock'

export type InviteEvent =
  | DomainEvent<
      'InviteCreated',
      {
        creatorId: string
        userId: string
        gameType: InviteType
        gameId: string
      }
    >
  | DomainEvent<'InviteDeclined'>
  | DomainEvent<'InviteAccepted'>
  | DomainEvent<'InviteCancelled'>

export type InviteCmd =
  | DomainCmd<
      'CreateInvite',
      {
        creatorId: string
        userId: string
        gameType: InviteType
        gameId: string
      }
    >
  | DomainCmd<'DeclineInvite'>
  | DomainCmd<'AcceptInvite'>
  | DomainCmd<'CancelInvite'>

export type InviteAgg = {
  state: 'new' | 'created' | 'resolved'
  creatorId: string
  userId: string
  gameType: InviteType
  gameId: string
}

export enum InviteState {
  Pending = 'pending',
  Cancelled = 'cancelled',
  Accepted = 'accepted',
  Declined = 'declined',
}

export type InviteSchema = {
  id: string
  userId: string
  creatorId: string
  gameId: string
  gameType: InviteType
  state: InviteState
}

export type InviteDTO = {
  id: string
  userId: string
  creatorId: string
  gameId: string
  gameType: InviteType
  state: InviteState
}

export type InviteMessages =
  | Msg<
      'invite',
      {
        id: string
        gameType: InviteType
        gameId: string
        creatorId: string
        userId: string
      }
    >
  | Msg<'invite-update', { id: string; state: InviteState }>
