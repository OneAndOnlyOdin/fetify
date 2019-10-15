import { wrap } from '../util'
import { LockConfig } from '../../domain/lock/types'
import * as uuid from 'uuid'
import { lockDomain } from '../../domain/lock'

type Body = LockConfig

export const createLock = wrap(async (req, res) => {
  const body: Body = req.body
  const user = req.user!

  const id = uuid.v4().slice(0, 7)
  res.json(id)

  lockDomain.cmd.CreateLock(id, {
    config: body,
    userId: user.userId,
  })
})
