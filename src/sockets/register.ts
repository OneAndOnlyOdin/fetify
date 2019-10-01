import * as jwt from 'jsonwebtoken'
import { WebSocket } from 'ws'
import { Message, subscribe } from '../db/message'
import { config } from '../env'

const allUsers = new Set<WebSocket>()

const userMap = new Map<string, WebSocket[]>()

subscribe(listener)

function listener(msg: Message) {
  const { type, payload } = msg

  const output = JSON.stringify({ type, payload })

  const sockets =
    msg.target === 'all' ? getAllSockets() : getUserSockets(msg.target)

  for (const ws of sockets) {
    ws.send(output)
  }
  return
}

type SocketMessage = LoginMessage

type LoginMessage = {
  type: 'login'
  payload: { token: string }
}

export function registerSocket(ws: WebSocket) {
  allUsers.add(ws)

  ws.on('message', msg => {
    try {
      const data: SocketMessage = JSON.parse(msg as string)

      if ('type' in data === false) {
        return
      }

      if ('payload' in data === false) {
        return
      }

      // TODO: Use a dispatcher for handling messages
      switch (data.type) {
        case 'login':
          return handleLogin(data, ws)
      }
    } catch (ex) {
      // Intentional NOOP
    }
  })

  ws.on('close', () => {
    allUsers.delete(ws)

    if (ws.userId) {
      const sockets = userMap.get(ws.userId) || []

      const nextSockets = sockets.filter(socket => socket !== ws)
      userMap.set(ws.userId, nextSockets)
    }
  })
}

function handleLogin(msg: LoginMessage, socket: WebSocket): string | void {
  try {
    const payload = jwt.verify(msg.payload.token, config.jwtSecret) as any
    const sockets = userMap.get(payload.userId) || []
    sockets.push(socket)
    socket.userId = payload.userId
    userMap.set(payload.userId, sockets)
  } catch (ex) {}
}

function getUserSockets(userId: string) {
  const sockets = userMap.get(userId) || []
  return sockets.slice()
}

function getAllSockets() {
  return Array.from(allUsers)
}
