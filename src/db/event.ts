import { connect, Timestamp, Collection } from 'mongodb'
import { config } from '../env'
import { StoredEvent } from '../es'

export type Callback<T, U> = (collection: Collection<T>) => U

export const database = connect(
  config.dbUri,
  {
    useNewUrlParser: true,
    autoReconnect: true,
    reconnectTries: Infinity,
    ignoreUndefined: true,
    w: 'majority',
    j: true
  }
).then(client => client.db(config.dbName))

export interface BookmarkDocument {
  key: string
  bookmark: Timestamp
}

export const bookmarks = <T>(cb: Callback<BookmarkDocument, T>) =>
  getCollection<any>('bookmarks').then(cb)

export function getEventsCollection<T>() {
  return database.then(client => client.collection<StoredEvent<T>>('events'))
}

function getCollection<T>(name: string) {
  return database.then(coll => coll.collection<T>(name))
}
