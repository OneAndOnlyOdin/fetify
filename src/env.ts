import * as dotenv from 'dotenv'

dotenv.config()

export interface Env {
  appEnv: string
  logLevel: string
  port: number
  dbUri: string
  jwtSecret: string
  jwtExpiry: number
}

const defaults: Env = {
  appEnv: 'dev',
  logLevel: 'info',
  port: 3000,
  dbUri: 'mongodb://localhost:27017/fetify',
  jwtSecret: '',
  jwtExpiry: 24,
}

export const config: Env = {
  appEnv: getEnv('APP_ENV') || defaults.appEnv,
  logLevel: getEnv('LOG_LEVEL') || defaults.logLevel,
  port: Number(getEnv('PORT') || defaults.port),
  dbUri: getEnv('DB_URI') || defaults.dbUri,
  jwtSecret: getEnv('JWT_SECRET') || defaults.jwtSecret,
  jwtExpiry: Number(getEnv('JWT_EXPIRY') || defaults.jwtExpiry),
}

if (!config.jwtSecret) throw new Error('JWT_SECRET not set')

function getEnv(key: string): string | undefined {
  return process.env[key]
}
