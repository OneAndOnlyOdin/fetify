import { ESEvent, StoredEvent } from '../types'

type EventsFrom<TEvent extends ESEvent, TPosition = unknown> = (
  from: TPosition,
  filterTypes?: Array<TEvent['type']>
) => Promise<StoredEvent<TEvent>[]>

type EventsById<TEvent extends ESEvent> = (
  id: string,
  options: Partial<TEvent>
) => Promise<StoredEvent<TEvent>[]>

export type ReaderOptions<TEvent extends ESEvent, TPosition = unknown> = {
  getEventsFrom: EventsFrom<TEvent, TPosition>
  getEventsById: EventsById<TEvent>
}

export class StoreReader<TEvent extends ESEvent, TPosition = unknown> {
  getEventsById: EventsById<TEvent>
  getEventsFrom: EventsFrom<TEvent, TPosition>

  constructor(opts: ReaderOptions<TEvent, TPosition>) {
    this.getEventsById = opts.getEventsById
    this.getEventsFrom = opts.getEventsFrom
  }
}
