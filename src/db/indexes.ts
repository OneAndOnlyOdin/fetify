import { Db } from 'mongodb'

export async function ensureIndexes(db: Db) {
  await db.collection('auth').createIndex({ username: 1 }, { name: 'auth_username', unique: true })

  await db.collection('userProfiles').createIndex({ userId: 1 }, { name: 'userProfiles_userId', unique: true })

  await db.collection('gameLock').createIndex({ id: 1 }, { name: 'gameLock_id', unique: true })

  await db.collection('lockState').createIndex({ aggregateId: 1 }, { name: 'lockState_aggregateId', unique: true })
}
