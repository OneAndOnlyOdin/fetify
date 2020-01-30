import { wrap } from '../util'
import { lockDomain } from '../../domain/lock'
import { LockSchema } from '../../domain/lock/store'

export const getLocks = wrap(async (req, res) => {
  const user = req.user!
  const id: string = req.params.id
  const version = Number(req.params.version)

  if (!id) {
    const { locks, count } = await lockDomain.store.getLocks(user.userId)
    const dtos = locks.map(lock => toDto(lock, user.userId, false))

    res.json({ locks: dtos, count })
    return
  }

  if (!version) {
    const lock = await lockDomain.store.getLock(id)
    if (!lock) {
      return res.status(404).send()
    }

    res.json(toDto(lock, user.userId, true))
    return
  }

  const lock = await lockDomain.store.getLock(id, version)
  if (lock) {
    res.json(toDto(lock, user.userId, true))
    return
  }

  return res.status(304).send()
})

/**
 *
 * @param lock
 * @param userId
 * @param history include the lock history
 */
function toDto(lock: LockSchema, userId: string, history: boolean) {
  return lockDomain.store.toLockDto(lock, { forUser: userId, history })
}
