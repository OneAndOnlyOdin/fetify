import { wrap } from '../util'
import { getInvites } from '../../domain/invite/store'

export const listInvites = wrap(async (req, res) => {
  const invites = await getInvites(req.user!.userId)

  res.json({ invites })
})
