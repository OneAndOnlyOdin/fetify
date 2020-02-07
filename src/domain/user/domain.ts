import { createDomain } from 'evtstore'
import { UserEvent, UserAggregate, UserCmd } from './types'
import { getProvider } from '../util'
import { v4 } from 'uuid'

export const domain = createDomain<UserEvent, UserAggregate, UserCmd>(
  {
    stream: 'users',
    provider: getProvider<UserEvent>(),
    aggregate: () => ({
      state: 'new',
      aggregateId: '',
      alias: '',
      email: '',
      version: 0,
      apiKey: '',
    }),
    fold: ev => {
      switch (ev.type) {
        case 'UserCreated':
          return { state: 'created' }

        case 'AliasUpdated':
          return { alias: ev.alias }

        case 'EmailUpdated':
          return { email: ev.email }

        case 'KeyGenerated':
          return { key: ev.key }

        case 'KeyRemoved':
          return { key: '' }
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
    GenerateKey: async (_, agg) => {
      if (agg.state !== 'new') throw new Error('User does not exist')
      const chars = v4()
      const key = chars
        .split('')
        .map(char => (Math.random() > 0.5 ? char : char.toUpperCase()))
        .join('')
      return { type: 'KeyGenerated', key }
    },
    RemoveKey: async (_, agg) => {
      if (agg.state !== 'new') throw new Error('User does not exist')
      if (agg.apiKey === '') return
      return { type: 'KeyRemoved' }
    },
  }
)
