import { DomainEvent, DomainCmd } from '../util'

export type UserEvent =
  | DomainEvent<'UserCreated'>
  | DomainEvent<'AliasUpdated', { alias: string }>
  | DomainEvent<'EmailUpdated', { email: string }>
  | DomainEvent<'KeyGenerated', { key: string }>
  | DomainEvent<'KeyRemoved', {}>

export type UserCmd =
  | DomainCmd<'CreateUser'>
  | DomainCmd<'UpdateAlias', { alias: string }>
  | DomainCmd<'UpdateEmail', { email: string }>
  | DomainCmd<'GenerateKey', {}>
  | DomainCmd<'RemoveKey', {}>

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
  apiKey: string
}

export type UserProfile = {
  userId: string
  apiKey: string
  alias?: string
  email?: string
}
