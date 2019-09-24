import { wrap } from '../util'
import { lockDomain } from '../../domain/game/lock'

export const getLocks = wrap(async (req, res) => {
  const user = req.user!

  const locks = await lockDomain.store.getLocks(user.username)
  const dtos = locks.map(lockDomain.store.toLockDto)

  res.json(dtos)
})
