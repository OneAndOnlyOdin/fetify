import { domain } from './domain'
import { lockMgr } from './manager'
import { lockPopulator } from './populator'
import * as store from './store'

export * from './types'

export const lockDomain = {
  cmd: domain.command,
  mgr: lockMgr,
  pop: lockPopulator,
  store,
}
