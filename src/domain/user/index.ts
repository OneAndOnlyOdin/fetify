import * as Domain from './types'
import { userCmd } from './command'
import { userManager } from './manager'
import * as store from './store'

export const userDomain = {
  cmd: userCmd,
  mgr: userManager,
  Domain,
  store
}
