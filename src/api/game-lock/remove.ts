import { wrap, StatusError } from '../util'
import { getLock } from '../../domain/game/lock/store'
import { lockDomain } from '../../domain/game'

export const removeLock = wrap(async (req, res) => {
  const user = req.user!
  const lock = await getLock(req.params.id)

  if (!lock) throw new StatusError('Lock not found', 404)

  const canDelete =
    lock.ownerId === user.userId || lock.playerId === user.userId
  if (!canDelete) throw new StatusError('Unauthorized', 403)

  await lockDomain.cmd.DeleteLock({ aggregateId: lock.id })
  res.json({ message: 'OK' })
})
