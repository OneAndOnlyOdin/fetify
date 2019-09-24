import * as UserDomain from './types'
import { userCmd } from './command'
import { userManager } from './manager'
import * as store from './store'

export { UserDomain }

export const userDomain = {
  cmd: userCmd,
  mgr: userManager,
  store
}
