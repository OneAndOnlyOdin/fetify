import { eventHandler } from '../../es'
import { UserEvent } from './types'
import { createUser, setUser } from './store'

export const userManager = eventHandler.createMongoHandler<UserEvent>({
  bookmark: 'user-bookmark',
  eventStream: 'users',
  name: 'user-manager'
})

userManager.handle('UserCreated', async ev => {
  await createUser({
    userId: ev.aggregateId,
    alias: '',
    email: ''
  })
})

userManager.handle('AliasUpdated', async ({ event }) => {
  await setUser(event.aggregateId, { alias: event.alias })
})

userManager.handle('EmailUpdated', async ({ event }) => {
  await setUser(event.aggregateId, { email: event.email })
})
