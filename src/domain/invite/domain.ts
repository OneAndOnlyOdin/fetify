import { createDomain, CommandError } from 'evtstore'
import { InviteEvent, InviteAgg, InviteCmd } from './types'
import { getProvider } from '../util'
import { getUser } from '../user/store'
import { lockDomain } from '../lock'
import { getLockState } from '../lock/store'

export const domain = createDomain<InviteEvent, InviteAgg, InviteCmd>(
  {
    stream: 'invite-event',
    aggregate: () => ({
      creatorId: '',
      gameId: '',
      gameType: 'lock',
      state: 'new',
      userId: '',
    }),
    fold: ev => {
      switch (ev.type) {
        case 'InviteCreated':
          return {
            state: 'created',
            gameId: ev.gameId,
            userId: ev.userId,
            gameType: ev.gameType,
          }

        case 'InviteAccepted':
        case 'InviteCancelled':
        case 'InviteDeclined':
          return { state: 'resolved' }
      }
    },
    provider: getProvider<InviteEvent>(),
  },
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

      await lockDomain.cmd.JoinLock(agg.gameId, {
        userId: agg.userId,
      })

      return {
        type: 'InviteAccepted',
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
    DeclineInvite: async (cmd, agg) => {
      if (agg.state !== 'created') return
      return {
        type: 'InviteDeclined',
        aggregateId: cmd.aggregateId,
      }
    },
  }
)
