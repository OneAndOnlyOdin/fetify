import { config } from '../env'
import { SocketMsg } from '../../src/sockets/types'
import { state } from './auth'

type ExtractMsg<TType extends SocketMsg['type']> = Extract<
  SocketMsg,
  { type: TType }
>['payload']

type Condition<T extends SocketMsg['type']> = {
  [key in keyof ExtractMsg<T>]?: ExtractMsg<T>[key]
} & { type: T }

type Listener<T extends SocketMsg['type'] = any> = {
  condition: Condition<T>
  callback: (payload: ExtractMsg<T>) => void
}

let currentId = 0
const listeners = new Map<number, Listener>()

let socket = createSocket()

function createSocket() {
  const base = config.apiUrl
    .replace('http://', 'ws://')
    .replace('https://', 'wss://')
  const ws = new WebSocket(base + '/ws')
  ws.onopen = () => {
    login(state.token || '')
  }

  ws.onmessage = msg => {
    if (typeof msg.data !== 'string') {
      return
    }

    const blobs = msg.data.split('\n')
    for (const blob of blobs) {
      try {
        const data = JSON.parse(blob)
        dispatch(data)
      } catch (ex) {}
    }
  }

  ws.onclose = () => {
    setTimeout(() => {
      socket = createSocket()
    }, 5000)
  }

  ws.onerror = (_error: any) => {
    ws.close()
  }

  return ws
}

function dispatch(msg: SocketMsg) {
  const entries = listeners.entries()
  for (const [id, listener] of Array.from(entries)) {
    if (listener.condition.type !== msg.type) {
      continue
    }

    let isMatch = true
    for (const key in listener.condition) {
      if (key === 'type') continue
      const payload: any = msg.payload
      const condition: any = listener.condition

      if (payload[key] !== condition[key]) {
        isMatch = false
      }
    }

    if (isMatch) {
      listener.callback(msg.payload)
      listeners.delete(id)
    }
  }
}

function login(token: string) {
  const message = {
    type: 'login',
    payload: { token },
  }
  const payload = JSON.stringify(message)
  send(payload)
}

function send(payload: string) {
  socket.send(payload)
}

export function logout() {
  const message = {
    type: 'logout',
  }
  const payload = JSON.stringify(message)
  send(payload)
}

function subscribe<T extends SocketMsg['type']>(condition: Condition<T>) {
  return new Promise<ExtractMsg<T>>(resolve => {
    // TODO: Can timeout here by calling reject in setTimeout then remove the listener
    const id = ++currentId

    listeners.set(id, {
      condition,
      callback: msg => resolve(msg as any),
    })
  })
}

export const webSockets = { subscribe }
