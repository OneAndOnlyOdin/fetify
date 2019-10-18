import { collections } from '../db/event'
import { Event, Provider, VersionError } from 'evtstore'
import { Collection, Timestamp, MongoError } from 'mongodb'

export async function getProvider<T extends Event>(): Promise<Provider<T>> {
  const events: Collection<StoredEvent<T>> = await collections.events
  const bookmarks: Collection<Bookmark> = await collections.bookmarks
  return {
    driver: 'fet-mongo',
    getPosition: async key => {
      const bookmark = await bookmarks.findOne({ key })
      if (bookmark) return bookmark.bookmark
      return new Timestamp(0, 0)
    },
    setPosition: async (key, bookmark) => {
      await bookmarks.updateOne(
        { key },
        { $set: { bookmark } },
        { upsert: true }
      )
    },
    getEventsFor: async (stream, id) => {
      return events
        .find({ 'event.aggregateId': id, stream })
        .sort({ version: 1 })
        .toArray()
        .then(rows => rows.map(toEvtStore))
    },
    getEventsFrom: async (stream, position) => {
      return events
        .find({ stream, position: { $gt: position } })
        .sort({ position: 1 })
        .limit(100)
        .toArray()
        .then(rows => rows.map(toEvtStore))
    },
    append: async (stream, event, id, version) => {
      try {
        await events.insertOne({
          stream,
          position: new Timestamp(0, 0),
          timestamp: new Date(Date.now()),
          version,
          aggregateId: id,
          type: event.type,
          event: { ...event, aggregateId: id },
        })
      } catch (ex) {
        if (ex instanceof MongoError && ex.code === 11000)
          throw new VersionError()
        throw ex
      }
    },
  }
}

export async function createIndexes() {
  const events: Collection<StoredEvent<never>> = await collections.events
  const bookmarks: Collection<Bookmark> = await collections.bookmarks

  await bookmarks.createIndex(
    { key: 1 },
    { name: 'bookmarks-key', unique: true }
  )

  await events.createIndex(
    { position: 1, stream: 1 },
    { name: 'events_position-stream' }
  )

  await events.createIndex(
    { position: 1, aggregateId: 1, stream: 1 },
    { name: 'events_pos-aggId-stream', unique: true }
  )

  await events.createIndex(
    { stream: 1, aggregateId: 1, version: 1 },
    { name: 'events_pos-aggrId-version', unique: true }
  )
}

function toEvtStore<T>(evt: StoredEvent<T>) {
  return { ...evt, aggregateId: evt.event.aggregateId }
}

export type DomainEvent<T extends string, U extends {} = {}> = { type: T } & U
export type DomainCmd<T extends string, U extends {} = {}> = { type: T } & U

type StoredEvent<E = unknown> = {
  stream: string
  position: any
  version: number
  timestamp: Date
  aggregateId: string
  type: string
  event: E & { aggregateId: string; type: string }
}

type Bookmark = {
  key: string
  bookmark: Timestamp
}
