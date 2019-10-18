import * as dotenv from 'dotenv'

dotenv.config()

export interface Env {
  appEnv: string
  logLevel: string
  port: number
  jwtSecret: string
  jwtExpiry: number
  db: {
    uri: string
    events: string
    bookmarks: string
  }
}

const defaults: Env = {
  appEnv: 'dev',
  logLevel: 'info',
  port: 3000,
  db: {
    uri: 'mongodb://localhost:27017/fetify',
    events: 'events',
    bookmarks: 'bookmarks',
  },
  jwtSecret: '',
  jwtExpiry: 24,
}

export const config: Env = {
  appEnv: getEnv('APP_ENV') || defaults.appEnv,
  logLevel: getEnv('LOG_LEVEL') || defaults.logLevel,
  port: Number(getEnv('PORT') || defaults.port),
  db: {
    uri: getEnv('DB_URI') || defaults.db.uri,
    events: getEnv('DB_EVENTS') || defaults.db.events,
    bookmarks: getEnv('DB_BOOKMARKS') || defaults.db.bookmarks,
  },
  jwtSecret: getEnv('JWT_SECRET') || defaults.jwtSecret,
  jwtExpiry: Number(getEnv('JWT_EXPIRY') || defaults.jwtExpiry),
}

if (!config.jwtSecret) throw new Error('JWT_SECRET not set')

function getEnv(key: string): string | undefined {
  return process.env[key]
}
