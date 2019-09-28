import { LockDTO } from '../domain/game/lock/store'
import { LockAction } from '../domain/game/lock/types'

export type SocketMsg = LockMsg | LockDrawMsg

export type LockMsg = {
  type: 'lock'
  payload: LockDTO
}

export type LockDrawMsg = {
  type: 'lock-draw'
  payload: {
    lockId: string
    card: number
    action: LockAction
  }
}
