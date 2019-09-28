import { wrap, StatusError } from '../util'
import { lockDomain } from '../../domain/game'
import { LockSchema } from '../../domain/game/lock/store'
import { svcSockets } from '../../sockets/publish'

type Body = { card: number }

export const drawLockCard = wrap(async (req, res) => {
  const id: string = req.params.id
  const { card }: Body = req.body

  if (card === undefined) {
    throw new StatusError('No card provided', 400)
  }

  const cardNo = Number(card)
  if (isNaN(cardNo)) {
    throw new StatusError('Invalid card number provided', 400)
  }

  const lock = await lockDomain.store.getLock(id)
  if (!lock) {
    throw new StatusError('Lock not found', 404)
  }

  const isAuthed = canDraw(req.user!.userId, lock)
  if (!isAuthed) {
    throw new StatusError('Not allowed to draw on this lock', 403)
  }

  const action = lock.actions.find((_, i) => i === cardNo)
  if (!action) {
    throw new StatusError(
      'Invalid card number provided: No card in that position found',
      400
    )
  }

  svcSockets.toUser(lock.ownerId, {
    type: 'lock-draw',
    payload: { card: cardNo, action, lockId: lock.id },
  })

  if (lock.playerId) {
    svcSockets.toUser(lock.playerId, {
      type: 'lock-draw',
      payload: { card: cardNo, action, lockId: lock.id },
    })
  }

  await lockDomain.cmd.DrawCard({
    aggregateId: id,
    card,
  })

  res.json(action)
})

function canDraw(userId: string, lock: LockSchema) {
  if (lock.config.owner === 'self') {
    return userId === lock.ownerId
  }

  return lock.playerId !== undefined && lock.playerId === userId
}
