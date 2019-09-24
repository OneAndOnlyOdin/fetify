import { SocketMsg } from './types'
import { publish } from '../db/message'

async function toAll(payload: SocketMsg) {
  await publish({
    target: 'all',
    type: payload.type,
    payload: payload.payload,
  })
}

async function toUser(userId: string, payload: SocketMsg) {
  await publish({
    target: userId,
    type: payload.type,
    payload: payload.payload,
  })
}

export const svcSockets = { toAll, toUser }
