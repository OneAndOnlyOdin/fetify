import { wrap, StatusError } from '../util'
import { toActionConfig } from '../../domain/game/lock/util'
import { lockDomain } from '../../domain/game'

export const addCards = wrap(async (req, res) => {
  if (!req.body.cards)
    throw new StatusError('"cards" property not specified', 400)

  const cfg = toActionConfig(req.body.cards)

  await lockDomain.cmd.AddActions({ aggregateId: req.params.id, actions: cfg })

  res.json({ message: 'OK' })
})
