import { domain } from './domain'
import { InviteState } from './types'
import { svcSockets } from '../../sockets/publish'
import { userInvites, getInvite } from './store'

export { pop as invitePopulator }

const pop = domain.handler('invite-populator')

pop.handle('InviteCreated', async (id, event) => {
  await userInvites.then(tbl =>
    tbl.insertOne({
      id,
      state: InviteState.Pending,
      creatorId: event.creatorId,
      userId: event.userId,
      gameId: event.gameId,
      gameType: event.gameType,
    })
  )

  svcSockets.toUser([event.creatorId, event.userId], {
    type: 'invite',
    payload: {
      userId: event.userId,
      creatorId: event.creatorId,
      gameId: event.gameId,
      gameType: event.gameType,
      id,
    },
  })
})
pop.handle('InviteAccepted', async id => {
  await userInvites.then(tbl =>
    tbl.updateOne({ id }, { $set: { state: InviteState.Accepted } })
  )

  await sendUpdate(id, InviteState.Accepted)
})

pop.handle('InviteDeclined', async id => {
  await userInvites.then(tbl =>
    tbl.updateOne({ id }, { $set: { state: InviteState.Declined } })
  )
  sendUpdate(id, InviteState.Declined)
})
pop.handle('InviteCancelled', async id => {
  await userInvites.then(tbl =>
    tbl.updateOne({ id }, { $set: { state: InviteState.Cancelled } })
  )
  sendUpdate(id, InviteState.Cancelled)
})

async function sendUpdate(inviteId: string, state: InviteState) {
  const invite = await getInvite(inviteId)
  if (!invite) return

  svcSockets.toUser([invite.creatorId, invite.userId], {
    type: 'invite-update',
    payload: { id: inviteId, state },
  })
}
