import { wrap } from '../util'
import { database, bookmarks, events } from '../../db/event'
import { lockDomain } from '../../domain/game'

export const clearLock = wrap(async (_, res) => {
  lockDomain.mgr.stop()
  await database.then(db => db.collection('gameLock').deleteMany({}))
  await bookmarks(cb => cb.deleteOne({ key: 'lock-bookmark' }))

  if (_.body.events) {
    await events().then(cb => cb.deleteMany({ stream: 'gameLock' }))
  }

  lockDomain.mgr.reset()
  lockDomain.mgr.start()

  res.json('OK')
})
