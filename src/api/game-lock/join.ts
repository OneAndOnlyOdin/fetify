import { wrap, StatusError } from '../util'
import { lockDomain } from '../../domain/game'

export const joinLock = wrap(async (req, res) => {
  const userId = req.user!.userId
  const lockId = req.params.id

  if (!userId || !lockId) {
    throw new StatusError('Missing lock or user id', 400)
  }

  await lockDomain.cmd.JoinLock({ aggregateId: lockId, userId })

  res.json({ message: 'OK' })
})
