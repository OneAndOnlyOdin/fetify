import * as dotenv from 'dotenv'

dotenv.config()

export interface Env {
  appEnv: string
  logLevel: string
  port: number
  dbUri: string
  dbName: string
}

const defaults: Env = {
  appEnv: 'dev',
  logLevel: 'info',
  port: 3000,
  dbUri: 'mongodb://localhost:27017',
  dbName: 'fetify'
}

export const config: Env = {
  appEnv: getEnv('APP_ENV') || defaults.appEnv,
  logLevel: getEnv('LOG_LEVEL') || defaults.logLevel,
  port: Number(getEnv('PORT') || defaults.port),
  dbUri: getEnv('DB_URI') || defaults.dbUri,
  dbName: getEnv('DB_NAME') || defaults.dbName
}

function getEnv(key: string): string | undefined {
  return process.env[key]
}
