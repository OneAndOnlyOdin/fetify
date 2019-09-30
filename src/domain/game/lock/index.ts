import * as LockDomain from './types'
import * as store from './store'
import { lockCmd } from './command'
import { lockMgr } from './manager'
import { lockPopulator } from './populator'

export { LockDomain }

export const lockDomain = {
  store,
  cmd: lockCmd,
  mgr: lockMgr,
  pop: lockPopulator,
}
