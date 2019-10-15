import { domain } from './domain'
import { createUser, setUser } from './store'

export const userManager = domain.handler('user-mgr-bookmark')

userManager.handle('UserCreated', async id => {
  await createUser({
    userId: id,
    alias: '',
    email: '',
  })
})

userManager.handle('AliasUpdated', async (id, { alias }) => {
  await setUser(id, { alias })
})

userManager.handle('EmailUpdated', async (id, { email }) => {
  await setUser(id, { email })
})
