import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { database } from './event'
import { config } from '../env'
import { userDomain } from '../domain/user'

type Auth = {
  username: string
  hash: string
}

const table = database.then(db => db.collection<Auth>('auth'))

async function createUser(username: string, password: string) {
  const user = await table.then(coll => coll.findOne({ username }))
  if (!user) {
    throw new Error('User already exists')
  }

  const hash = await encrypt(password)
  await table.then(coll => coll.insertOne({ username, hash }))
}

async function getUser(username: string) {
  const user = await table.then(coll => coll.findOne({ username }))
  return user
}

const salt = getSalt()

async function encrypt(value: string) {
  const hashed = await bcrypt.hash(value, await salt)
  return hashed
}

async function compare(input: string, hashed: string) {
  const result = await bcrypt.compare(input, hashed)
  return result
}

async function getSalt() {
  const salt = await bcrypt.genSalt(10)
  return salt
}

const ONE_HOUR_MS = 1000 * 60 * 60
async function createToken(userId: string) {
  const profile = await userDomain.store.getUser(userId)
  if (!profile) {
    throw new Error('No profile found for user')
  }

  const expires = Date.now() + ONE_HOUR_MS * config.jwtExpiry
  const payload = {
    expires,
    ...profile,
  }

  const expiresIn = (ONE_HOUR_MS * config.jwtExpiry) / 1000
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn })
  return token
}

export const auth = {
  createUser,
  createToken,
  getUser,
  compare,
}
