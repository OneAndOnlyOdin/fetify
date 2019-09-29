import { ESEvent, EventStream } from '../types'
import { createMongoReader } from '../store'
import { ESEventHandler } from './create'
import { Timestamp } from 'bson'
import { createMongoBookmark } from '../bookmark'

export interface MongoOptions {
  name: string
  eventStream: EventStream
  bookmark: string
}

export function createMongoHandler<TEvent extends ESEvent>(opts: MongoOptions) {
  const bookmark = createMongoBookmark(opts.bookmark)
  const reader = createMongoReader<TEvent>(opts.eventStream)

  const handler = new ESEventHandler<TEvent, Timestamp>({
    name: opts.name,
    bookmark,
    reader,
  })

  return handler
}
