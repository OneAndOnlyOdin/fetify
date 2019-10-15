import {
  InviteDTO,
  InviteType,
  InviteState as State,
} from '../../src/domain/invite/types'
import { api } from './api'
import { webSockets } from './socket'

interface InviteState {
  invites: InviteDTO[]
}

export const state: InviteState = {
  invites: [],
}

export function getInvites() {
  return api.get<{ invites: InviteDTO[] }>('/api/invite')
}

type CreateInvite = {
  gameType: InviteType
  gameId: string
  userId: string
}
export function createInvite(opts: CreateInvite) {
  return api.post('/api/invite', opts)
}

webSockets.on(msg => {
  switch (msg.type) {
    case 'invite': {
      state.invites.unshift({ ...msg.payload, state: State.Pending })
      return
    }

    case 'invite-update': {
      for (const invite of state.invites) {
        if (invite.id !== msg.payload.id) continue
        invite.state = msg.payload.state
      }
      return
    }
  }
})
