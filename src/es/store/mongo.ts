import { events } from '../../db/event'
import { Timestamp } from 'bson'
import { ESEvent, StoredEvent, NewEvent, EventStream } from '../types'
import { StoreReader } from './reader'
import { StoreWriter } from './writer'
import { isAggregateVersionConflict, VersionConflictError } from './error'

export function createMongoReader<TEvent extends ESEvent>(stream: EventStream) {
  const collection = events()

  const getEventsFrom = async (
    position: Timestamp,
    filterTypes: string[] = []
  ) => {
    const query: any = {
      stream,
      position: { $gt: position },
    }

    if (filterTypes.length) {
      query.type = { $in: filterTypes }
    }

    const events = await collection.then(coll =>
      coll
        .find<StoredEvent<TEvent>>(query)
        .sort({ position: 1 })
        .limit(100)
        .toArray()
    )
    return events
  }

  const getEventsById = async (
    id: string,
    filter: { [key in keyof TEvent]?: any },
    filterTypes: string[] = []
  ) => {
    type FilterKey = keyof typeof filter
    const translatedFilter = Object.keys(filter).reduce<any>((prev, curr) => {
      const key = `event.${curr}`
      prev[key] = filter[curr as FilterKey]
      return prev
    }, {})
    const query: any = { aggregateId: id, ...translatedFilter }

    if (filterTypes.length) {
      query.type = { $in: filterTypes }
    }

    const events = await collection.then(coll =>
      coll
        .find<StoredEvent<TEvent>>(query)
        .sort({ version: 1 })
        .toArray()
    )

    return events
  }

  return new StoreReader<TEvent, Timestamp>({
    getEventsById,
    getEventsFrom,
  })
}

export function createMongoWriter<TEvent extends ESEvent>(stream: string) {
  const collection = events()
  const append = async (version: number, ...events: NewEvent<TEvent>[]) => {
    if (!events.length) {
      return
    }

    const versionedEvents = events.map<
      StoredEvent<TEvent> & { timestamp: Date }
    >((event, i) => ({
      ...event,
      stream,
      version: version + 1 + i,
      position: new Timestamp(0, 0),
      timestamp: new Date(Date.now()),
    }))

    try {
      if (versionedEvents.length > 1) {
        await collection.then(coll =>
          coll.insertMany(versionedEvents, { ordered: true })
        )
        return
      }

      await collection.then(coll => coll.insertOne(versionedEvents[0]))
      return
    } catch (ex) {
      if (isAggregateVersionConflict(ex)) {
        throw new VersionConflictError(ex)
      }
      throw ex
    }
  }

  const writer = new StoreWriter<TEvent>({
    append,
  })

  return writer
}
