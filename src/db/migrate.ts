import * as provider from 'evtstore/provider/mongo'
import { createLogger } from '../logger'
import { ensureIndexes } from './indexes'
import { Db } from 'mongodb'
import * as path from 'path'
import { collections } from './event'

type EnsureFunc = (db: Db) => Promise<void>

export async function migrate() {
  await run(path.resolve(__dirname, 'settings.js'), ensureIndexes)
  const events = await collections.events
  const bookmarks = await collections.bookmarks
  await provider.migrate(events, bookmarks)
}

async function run(configFile: string, ensure: EnsureFunc) {
  const database = require('migrate-mongo').database
  const up = require('migrate-mongo').up

  const log = createLogger(`migrations`)

  /**
   * migrate-mongo will use global.options.file or coalesce to
   * migrate-mongo.config.js if global.options.file is not set
   */

  const cfg: any = global
  cfg.options = {
    file: configFile,
  }

  log.info('Connecting')
  const db = await database.connect()
  log.info(`Migrating...`)
  try {
    const applied = await up(db)
    log.info({ applied }, `Successfully migrated`)
    await ensure(db)
    log.info('Successfully ensured indexes')
  } catch (err) {
    log.error({ err }, 'Failed to migrate')
  }
}
