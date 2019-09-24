import * as LockDomain from './types'
import { lockCmd } from './command'
import { lockMgr } from './manager'
import * as store from './store'

export { LockDomain }

export const lockDomain = {
  store,
  cmd: lockCmd,
  mgr: lockMgr
}
