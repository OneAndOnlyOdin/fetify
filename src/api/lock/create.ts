import { wrap } from '../util'
import { LockConfig } from '../../domain/lock/types'
import * as uuid from 'uuid'
import { lockDomain } from '../../domain/lock'

type Body = LockConfig

export const createLock = wrap(async (req, res) => {
  const body: Body = req.body
  const user = req.user!

  validateConfig(body, req.user?.isApiUser)

  const id = uuid.v4().slice(0, 7)
  res.json(id)

  lockDomain.cmd.CreateLock(id, {
    config: body,
    userId: user.userId,
  })
})

function validateConfig(cfg: Body, isApiUser?: boolean) {
  if (isApiUser && cfg.owner !== 'self') {
    throw new Error('API Users can only create "self" locks')
  }
}
