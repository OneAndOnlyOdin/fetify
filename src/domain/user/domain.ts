import { createDomain } from 'evtstore'
import { UserEvent, UserAggregate, UserCmd } from './types'
import { getProvider } from '../util'

export const domain = createDomain<UserEvent, UserAggregate, UserCmd>(
  {
    stream: 'user-event',
    provider: getProvider<UserEvent>(),
    aggregate: () => ({
      state: 'new',
      aggregateId: '',
      alias: '',
      email: '',
      version: 0,
    }),
    fold: ev => {
      switch (ev.type) {
        case 'UserCreated':
          return { state: 'created' }

        case 'AliasUpdated':
          return { alias: ev.alias }

        case 'EmailUpdated':
          return { email: ev.email }
      }
    },
  },
  {
    CreateUser: async (cmd, agg) => {
      if (agg.state !== 'new') throw new Error('Command: User already exists')
      return {
        type: 'UserCreated',
        aggregateId: cmd.aggregateId,
      }
    },
    UpdateAlias: async (cmd, agg) => {
      if (agg.state === 'new') throw new Error('User does not exist')
      return {
        type: 'AliasUpdated',
        aggregateId: cmd.aggregateId,
        alias: cmd.alias,
      }
    },
    UpdateEmail: async (cmd, agg) => {
      if (agg.state === 'new') throw new Error('User does not exist')
      return {
        type: 'EmailUpdated',
        aggregateId: cmd.aggregateId,
        email: cmd.email,
      }
    },
  }
)
