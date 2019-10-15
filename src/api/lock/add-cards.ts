import { wrap, StatusError } from '../util'
import { toActionConfig } from '../../domain/lock/util'
import { lockDomain } from '../../domain/lock'

export const addCards = wrap(async (req, res) => {
  if (!req.body.cards)
    throw new StatusError('"cards" property not specified', 400)

  const cfg = toActionConfig(req.body.cards)

  await lockDomain.cmd.AddActions(req.params.id, { actions: cfg })

  res.json({ message: 'OK' })
})
