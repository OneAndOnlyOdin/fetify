import { Agg, ESEvent, Fold } from '../types'
import { StoreReader } from '../store'

export interface RepoOptions<TEvent extends ESEvent, TAgg extends Agg> {
  name: string
  factory: () => TAgg
  fold: Fold<TEvent, TAgg>
  reader: StoreReader<TEvent, any>
}

export class Repo<TEvent extends ESEvent, TAgg extends Agg> {
  name: string = ''
  factory: () => TAgg
  fold: Fold<TEvent, TAgg>
  reader: StoreReader<TEvent, any>

  constructor(opts: RepoOptions<TEvent, TAgg>) {
    this.name = opts.name
    this.factory = opts.factory
    this.fold = opts.fold
    this.reader = opts.reader
  }

  get = async (id: string, options?: Partial<TEvent>): Promise<TAgg> => {
    const events = await this.reader.getEventsById(id, options || {})
    let aggregate = this.factory()
    aggregate.aggregateId = id

    for (const event of events) {
      aggregate = this.fold(event, aggregate)
      aggregate.version = event.version
    }

    return aggregate
  }
}
