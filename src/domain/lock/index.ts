import { lockCmd } from './command'
import { lockMgr } from './manager'
import { lockPopulator } from './populator'
import * as store from './store'

export * from './types'

export const lockDomain = {
  cmd: lockCmd,
  mgr: lockMgr,
  pop: lockPopulator,
  store,
}
