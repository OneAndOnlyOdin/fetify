import { wrap } from '../util'
import { database, collections } from '../../db/event'
import { lockDomain } from '../../domain/lock'

export const clearLock = wrap(async (req, res) => {
  lockDomain.pop.stop()
  await database.then(db => db.collection('gameLock').deleteMany({}))
  await collections.bookmarks.then(cb =>
    cb.deleteOne({ key: 'lock-populator' })
  )

  if (req.body.events) {
    await collections.events.then(cb => cb.deleteMany({ stream: 'gameLock' }))
  }

  lockDomain.pop.reset()
  lockDomain.pop.start()

  res.json({ message: 'OK' })
})
