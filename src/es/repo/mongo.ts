import { Repo } from './create'
import { ESEvent, Agg, StoredEvent } from '../types'
import { createMongoReader } from '../store'

export type MongoRepoOptions<TEvent extends ESEvent, TAgg extends Agg> = {
  eventStream: string
  fold: (event: StoredEvent<TEvent>, agg: TAgg) => TAgg
  factory: () => TAgg
}

export function createMongoRepo<TEvent extends ESEvent, TAgg extends Agg>(
  opts: MongoRepoOptions<TEvent, TAgg>
) {
  const reader = createMongoReader<TEvent>(opts.eventStream)

  const repo = new Repo<TEvent, TAgg>({
    name: opts.eventStream,
    factory: opts.factory,
    fold: opts.fold,
    reader
  })

  return repo
}
