import { wrap } from '../util'
import { LockConfig } from '../../domain/game/lock/types'
import { lockCmd } from '../../domain/game/lock/command'
import * as uuid from 'uuid'

type Body = LockConfig

export const createLock = wrap(async (req, res) => {
  const body: Body = req.body
  const user = req.user!

  const id = uuid.v4().slice(0, 7)
  res.json(id)

  lockCmd.CreateLock({
    aggregateId: id,
    config: body,
    userId: user.userId,
  })
})
