import { LockDTO } from '../domain/game/lock/store'
import { LockAction } from '../domain/game/lock/types'

export type SocketMsg = LockMsg | LockDrawMsg | LockUpdate

export type LockMsg = {
  type: 'lock'
  payload: LockDTO
}

export type LockDraw = {
  lockId: string
  card: number
  action: LockAction
  task?: string
}

export type LockDrawMsg = {
  type: 'lock-draw'
  payload: LockDraw
}

export type LockUpdate = {
  type: 'lock-update'
  payload: {
    id: string
    update: Partial<LockDTO>
  }
}
