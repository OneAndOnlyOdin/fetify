import { inviteCmd } from './command'
import { invitePopulator } from './populator'

export * from './types'

export const inviteDomain = {
  cmd: inviteCmd,
  pop: invitePopulator,
}
