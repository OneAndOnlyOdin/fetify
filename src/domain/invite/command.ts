import { store, repo, StoredEvent, command } from '../../es'
import { InviteEvent, InviteAgg, InviteCmd } from './types'
import { CommandError } from '../../es/errors'
import { lockDomain } from '../lock'
import { getLockState } from '../lock/store'
import { getUser } from '../user/store'

const writer = store.createMongoWriter('invite')

const inviteRepo = repo.createMongoRepo<InviteEvent, InviteAgg>({
  eventStream: 'invite',
  factory: () => ({
    state: 'new',
    version: 0,
    aggregateId: '',
    gameId: '',
    gameType: 'lock',
    userId: '',
    creatorId: '',
  }),
  fold,
})

function fold({ event }: StoredEvent<InviteEvent>, agg: InviteAgg): InviteAgg {
  const next = { ...agg }

  switch (event.type) {
    case 'InviteCreated':
      next.state = 'created'
      next.gameId = event.gameId
      next.userId = event.userId
      next.gameType = event.gameType
      return next

    case 'InviteAccepted':
    case 'InviteCancelled':
    case 'InviteDeclined':
      next.state = 'resolved'
      return next
  }
}

export const inviteCmd = command.createHandler<
  InviteEvent,
  InviteCmd,
  InviteAgg
>(
  {
    CreateInvite: async (cmd, agg) => {
      if (agg.state !== 'new') return
      if (cmd.gameType !== 'lock')
        throw new CommandError('Unknown game type', 'UNKNOWN_GAMETYPE')

      const user = await getUser(cmd.userId)
      if (!user) throw new CommandError('Unknown user', 'UNKNOWN_USER')

      const lock = await lockDomain.store.getLockState(cmd.gameId)
      if (!lock) throw new CommandError('')
      if (!lock.joinable) return

      return {
        type: 'InviteCreated',
        aggregateId: cmd.aggregateId,
        creatorId: cmd.creatorId,
        gameType: cmd.gameType,
        gameId: cmd.gameId,
        userId: cmd.userId,
      }
    },
    AcceptInvite: async (cmd, agg) => {
      if (agg.state !== 'created') return
      const lock = await getLockState(agg.gameId)
      if (!lock || !lock.joinable) return

      await lockDomain.cmd.JoinLock({
        aggregateId: agg.gameId,
        userId: agg.userId,
      })

      return {
        type: 'InviteAccepted',
        aggregateId: cmd.aggregateId,
      }
    },
    DeclineInvite: async (cmd, agg) => {
      if (agg.state !== 'created') return
      return {
        type: 'InviteDeclined',
        aggregateId: cmd.aggregateId,
      }
    },
    CancelInvite: async (cmd, agg) => {
      if (agg.state !== 'created') return
      return {
        type: 'InviteCancelled',
        aggregateId: cmd.aggregateId,
      }
    },
  },
  inviteRepo,
  writer
)
