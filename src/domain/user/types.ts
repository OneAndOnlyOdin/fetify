import { DomainEvent, DomainCmd } from '../util'

export type UserEvent =
  | DomainEvent<'UserCreated'>
  | DomainEvent<'AliasUpdated', { alias: string }>
  | DomainEvent<'EmailUpdated', { email: string }>

export type UserCmd =
  | DomainCmd<'CreateUser'>
  | DomainCmd<'UpdateAlias', { alias: string }>
  | DomainCmd<'UpdateEmail', { email: string }>

export type User = {
  expires: number
  userId: string
  alias?: string
  email?: string
}

export type UserAggregate = {
  state: 'new' | 'created'
  alias: string
  email: string
}

export type UserProfile = {
  userId: string
  alias?: string
  email?: string
}
