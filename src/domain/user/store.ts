import { database } from '../../db/event'
import { UserProfile } from './types'

const coll = database.then(tbl => tbl.collection<UserProfile>('userProfiles'))

export async function getUser(userId: string) {
  return coll.then(coll => coll.findOne({ userId }))
}

export async function setUser(userId: string, profile: Partial<UserProfile>) {
  if (profile.userId) {
    throw new Error('Cannot change userId')
  }

  return coll.then(coll => coll.updateOne({ userId }, { $set: profile }))
}

export async function createUser(profile: UserProfile) {
  return coll.then(coll => coll.insertOne(profile))
}
