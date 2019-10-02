import { wrap } from '../util'
import { database, bookmarks, events } from '../../db/event'
import { lockDomain } from '../../domain/game'

export const clearLock = wrap(async (req, res) => {
  lockDomain.pop.stop()
  await database.then(db => db.collection('gameLock').deleteMany({}))
  await bookmarks(cb => cb.deleteOne({ key: 'lock-populator' }))

  if (req.body.events) {
    await events().then(cb => cb.deleteMany({ stream: 'gameLock' }))
  }

  lockDomain.pop.reset()
  lockDomain.pop.start()

  res.json({ message: 'OK' })
})
