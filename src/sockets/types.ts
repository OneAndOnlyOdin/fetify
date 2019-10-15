import { LockMessages } from '../domain/lock/types'
import { InviteMessages } from '../domain/invite'

export type SocketMsg = LockMessages | InviteMessages
