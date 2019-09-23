import { createLogger } from '../logger'
import { ensureIndexes } from './indexes'
import { Db } from 'mongodb'
import * as path from 'path'

type EnsureFunc = (db: Db) => Promise<void>

export async function migrate() {
  await run('game', path.resolve(__dirname, 'settings.js'), ensureIndexes)
}

async function run(name: string, configFile: string, ensure: EnsureFunc) {
  const database = require('migrate-mongo').database
  const up = require('migrate-mongo').up

  const log = createLogger(`migrations-${name}`)

  /**
   * migrate-mongo will use global.options.file or coalesce to
   * migrate-mongo.config.js if global.options.file is not set
   */

  const cfg: any = global
  cfg.options = {
    file: configFile
  }

  log.info('Connecting')
  const db = await database.connect()
  log.info(`Migrating...`)
  try {
    const applied = await up(db)
    log.info({ applied }, `Successfully migrated ${name}`)
    await ensure(db)
    log.info('Successfully ensured indexes')
  } catch (ex) {
    log.error({ ex }, 'Failed to migrate')
  }
}
