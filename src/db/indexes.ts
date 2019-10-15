import { Db } from 'mongodb'

export async function ensureIndexes(db: Db) {
  await db
    .collection('auth')
    .createIndex({ username: 1 }, { name: 'auth_username', unique: true })
}
