import { DomainEvent, DomainCmd, DomainAgg } from '../../es'

export type UserEvent =
  | DomainEvent<'UserCreated'>
  | DomainEvent<'AliasUpdated', { alias: string }>
  | DomainEvent<'EmailUpdated', { email: string }>

export type UserCmd =
  | DomainCmd<'CreateUser'>
  | DomainCmd<'UpdateAlias', { alias: string }>
  | DomainCmd<'UpdateEmail', { email: string }>

export type User = {
  userId: string
  alias?: string
  email?: string
}

export type UserAggregate = DomainAgg<{
  state: 'new' | 'created'
  alias: string
  email: string
}>

export type UserProfile = {
  userId: string
  alias?: string
  email?: string
}
