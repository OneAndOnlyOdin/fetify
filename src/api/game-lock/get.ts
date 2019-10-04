import { wrap } from '../util'
import { lockDomain } from '../../domain/game/lock'

export const getLocks = wrap(async (req, res) => {
  const user = req.user!

  const { locks, count } = await lockDomain.store.getLocks(user.userId)
  const dtos = locks.map(lock => lockDomain.store.toLockDto(lock, user.userId))

  res.json({ locks: dtos, count })
})
