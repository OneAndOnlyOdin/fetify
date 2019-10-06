import { wrap, StatusError } from '../util'
import { getLock } from '../../domain/lock/store'
import { lockDomain } from '../../domain/lock'

export const renameLock = wrap(async (req, res) => {
  const user = req.user!
  const lock = await getLock(req.params.id)
  const name: string = req.body.name

  if (!name) throw new StatusError('No name provided', 400)
  if (!lock) throw new StatusError('Lock not found', 404)

  const canRename =
    lock.ownerId === user.userId || lock.playerId === user.userId
  if (!canRename) throw new StatusError('Unauthorized', 403)

  await lockDomain.cmd.RenameLock({ aggregateId: lock.id, name })
  res.json({ message: 'OK' })
})
