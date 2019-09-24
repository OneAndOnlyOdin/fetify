import { LockDTO } from '../domain/game/lock/store'

export type SocketMsg = LockMsg

export type LockMsg = {
  type: 'lock'
  payload: LockDTO
}
