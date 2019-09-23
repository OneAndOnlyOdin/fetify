import { Db } from 'mongodb'
import { Table } from './event'
import { StoredEvent } from '../es'

export async function ensureIndexes(db: Db) {
  await db
    .collection<StoredEvent>(Table.Events)
    .createIndex({ position: 1, stream: 1 }, { name: 'events_position-stream' })

  await db
    .collection<StoredEvent>(Table.Events)
    .createIndex(
      { position: 1, aggregateId: 1, stream: 1 },
      { name: 'events_pos-aggId-stream', unique: true }
    )

  await db
    .collection<StoredEvent>(Table.Events)
    .createIndex(
      { stream: 1, aggregateId: 1, version: 1 },
      { name: 'events_pos-aggrId-version', unique: true }
    )

  await db
    .collection('auth')
    .createIndex({ username: 1 }, { name: 'auth_username', unique: true })
}
