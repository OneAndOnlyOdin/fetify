import * as uuid from 'uuid'
import { wrap, StatusError } from '../util'
import { InviteType, inviteDomain } from '../../domain/invite'

type Body = {
  type: InviteType
  gameId: string
  userId: string
}

export const createInvite = wrap(async (req, res) => {
  const creatorId = req.user!.userId
  const { type, gameId, userId }: Body = req.body

  assertValidGameType(type)

  const id = uuid.v4().slice(0, 8)

  await inviteDomain.cmd.CreateInvite(id, {
    gameType: type as InviteType,
    gameId,
    userId,
    creatorId,
  })

  res.json({ message: 'OK' })
})

function assertValidGameType(type: InviteType): boolean {
  switch (type) {
    case 'lock':
      return true
  }

  throw new StatusError('Invalid game type', 400)
}
