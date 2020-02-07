import { wrap, StatusError } from '../util'
import { lockDomain } from '../../domain/lock'
import { LockSchema } from '../../domain/lock/store'

type Body = { card: number }

export const drawLockCard = wrap(async (req, res) => {
  const user = req.user
  if (!user) throw new StatusError('Unauthorized', 401)

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

  await lockDomain.cmd.DrawCard(id, { card, userId: user.userId })

  res.json({ message: 'OK' })
})

function canDraw(userId: string, lock: LockSchema) {
  if (lock.config.owner === 'self') {
    return userId === lock.ownerId
  }

  return lock.playerId !== undefined && lock.playerId === userId
}
