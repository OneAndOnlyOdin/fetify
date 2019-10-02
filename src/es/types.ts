export type ExtractType<
  T extends U['type'],
  U extends { type: string }
> = U extends { type: T } ? U : never

export type EventStream = 'users' | 'gameLock'

export type ESWriter<TEvent extends ESEvent> = {
  append: AppendEvents<TEvent>
}

export type ESReader<TEvent extends ESEvent, TPosition = unknown> = {
  getEvents: GetEvents<TEvent>
  getEventsFrom: GetEventsFrom<TEvent, TPosition>
}

export type ESEvent = {
  type: string
  aggregateId: string
}

export type DomainEvent<T extends string, U = {}> = {
  type: T
  aggregateId: string
} & U

export type DomainCmd<T extends string, U = {}> = {
  type: T
  aggregateId: string
} & U

export type DomainAgg<T extends {}> = {
  aggregateId: string
  version: number
} & T

export type NewEvent<TEvent = unknown> = ESEvent & {
  event: TEvent
}

export type StoredEvent<TEvent = unknown> = NewEvent<TEvent> & {
  stream: string
  position: any
  version: number
  timestamp: Date
}

export type Command = {
  aggregateId: string
  type: string
}

export type Agg = {
  aggregateId: string
  version: number
}

export type EventTypes<TEvent extends ESEvent> = Array<TEvent['type']>

export type Fold<TEvent extends ESEvent, TAgg extends Agg> = (
  event: StoredEvent<TEvent>,
  agg: TAgg
) => TAgg

export type GetEvents<TEvent extends ESEvent> = (
  aggregateId: string
) => Promise<StoredEvent<TEvent>[]>

export type GetEventsFrom<TEvent extends ESEvent, TPosition = unknown> = (
  position: TPosition,
  eventTypes?: EventTypes<TEvent>
) => Promise<StoredEvent<TEvent>[]>

export type AppendEvents<TEvent extends ESEvent> = (
  version: number,
  ...events: NewEvent<TEvent>[]
) => Promise<void>
