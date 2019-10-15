import { domain } from './domain'
import * as store from './store'
import { invitePopulator } from './populator'

export * from './types'

export const inviteDomain = {
  cmd: domain.command,
  pop: invitePopulator,
  store,
}
