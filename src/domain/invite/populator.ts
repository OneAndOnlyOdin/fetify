import { eventHandler } from '../../es'
import { InviteEvent, InviteSchema, InviteState } from './types'
import { database } from '../../db/event'

export { pop as invitePopulator }

const coll = database.then(coll => coll.collection<InviteSchema>('userInvites'))

const pop = eventHandler.createMongoHandler<InviteEvent>({
  bookmark: 'invite-populator',
  eventStream: 'invite',
  name: 'invite-populator',
})

pop.handle('InviteCreated', async ({ event }) => {
  await coll.then(tbl =>
    tbl.insertOne({
      id: event.aggregateId,
      state: InviteState.Pending,
      creatorId: event.creatorId,
      userId: event.userId,
    })
  )
})
pop.handle('InviteAccepted', async ({ aggregateId }) => {
  await coll.then(tbl =>
    tbl.updateOne(
      { id: aggregateId },
      { $set: { state: InviteState.Accepted } }
    )
  )
})

pop.handle('InviteDeclined', async ({ aggregateId }) => {
  await coll.then(tbl =>
    tbl.updateOne(
      { id: aggregateId },
      { $set: { state: InviteState.Declined } }
    )
  )
})
pop.handle('InviteCancelled', async ({ aggregateId }) => {
  await coll.then(tbl =>
    tbl.updateOne(
      { id: aggregateId },
      { $set: { state: InviteState.Cancelled } }
    )
  )
})
