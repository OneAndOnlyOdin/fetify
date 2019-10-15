import { database } from '../../db/event'
import { InviteSchema, InviteState } from './types'

export const userInvites = database.then(coll =>
  coll.collection<InviteSchema>('userInvites')
)

export function getInvite(id: string) {
  return userInvites.then(tbl => tbl.findOne({ id }))
}

export function getInvites(userId: string, states?: InviteState[]) {
  const state = states ? { $in: states } : { $eq: InviteState.Pending }
  return userInvites.then(tbl =>
    tbl
      .find({
        $and: [{ state }, { $or: [{ userId }, { creatorId: userId }] }],
      })
      .project({ _id: 0 })
      .toArray()
  )
}
