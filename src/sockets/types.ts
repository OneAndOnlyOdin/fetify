import { LockMessages } from '../domain/lock/types'
import { InviteMessages } from '../domain/invite'

export type SocketMsg = LockMessages | InviteMessages

export type Payload<T extends SocketMsg['type']> = Extract<
  SocketMsg,
  { type: T }
>['payload']
