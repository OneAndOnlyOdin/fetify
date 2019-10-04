import { SocketMsg } from './types'
import { publish } from '../db/message'

async function toAll(payload: SocketMsg) {
  await publish({
    target: 'all',
    type: payload.type,
    payload: payload.payload,
  })
}

type UserId = string | Array<string | undefined>

async function toUser(userId: UserId, payload: SocketMsg) {
  if (Array.isArray(userId)) {
    for (const target of userId) {
      if (!target) continue
      await toUser(target, payload)
    }
    return
  }
  await publish({
    target: userId,
    type: payload.type,
    payload: payload.payload,
  })
}

export const svcSockets = { toAll, toUser }
