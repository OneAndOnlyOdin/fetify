import { command, repo, store } from '../../es'
import { UserEvent, UserCmd, UserAggregate } from './types'

const writer = store.createMongoWriter('users')

const userRepo = repo.createMongoRepo<UserEvent, UserAggregate>({
  eventStream: 'users',
  factory: () => ({
    state: 'new',
    aggregateId: '',
    alias: '',
    email: '',
    version: 0
  }),
  fold: ({ event }, agg) => {
    const next = { ...agg }
    switch (event.type) {
      case 'UserCreated':
        next.state = 'created'
        break

      case 'AliasUpdated':
        next.alias = event.alias
        break

      case 'EmailUpdated':
        next.email = event.email
    }

    return next
  }
})

export const userCmd = command.createHandler<UserEvent, UserCmd, UserAggregate>(
  {
    CreateUser: async (cmd, agg) => {
      if (agg.state !== 'new') throw new Error('Command: User already exists')
      return {
        type: 'UserCreated',
        aggregateId: cmd.aggregateId
      }
    },
    UpdateAlias: async (cmd, agg) => {
      if (agg.state === 'new') throw new Error('User does not exist')
      return {
        type: 'AliasUpdated',
        aggregateId: cmd.aggregateId,
        alias: cmd.alias
      }
    },
    UpdateEmail: async (cmd, agg) => {
      if (agg.state === 'new') throw new Error('User does not exist')
      return {
        type: 'EmailUpdated',
        aggregateId: cmd.aggregateId,
        email: cmd.email
      }
    }
  },
  userRepo,
  writer
)
