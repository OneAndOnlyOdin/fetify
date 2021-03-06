import { wrap, StatusError } from '../util'
import { toActionConfig } from '../../domain/lock/util'
import { lockDomain } from '../../domain/lock'

export const addCards = wrap(async (req, res) => {
  const user = req.user
  if (!user) throw new StatusError('Unauthorized', 401)

  if (!req.body.cards) throw new StatusError('"cards" property not specified', 400)

  const cfg = toActionConfig(req.body.cards)

  await lockDomain.cmd.AddActions(req.params.id, { actions: cfg, userId: user.userId })

  res.json({ message: 'OK' })
})
