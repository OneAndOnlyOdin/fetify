import { domain } from './domain'
import * as UserDomain from './types'
import { userManager } from './manager'
import * as store from './store'

export { UserDomain }

export const userDomain = {
  cmd: domain.command,
  mgr: userManager,
  store,
}
