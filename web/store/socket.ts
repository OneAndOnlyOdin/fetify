import { config } from '../env'
import { SocketMsg } from '../../src/sockets/types'
import { state, onAuth } from './auth'

let currentId = 0
const listeners = new Map<number, Listener>()

let socket = createSocket()

onAuth('login', () => {
  login(state.token!)
})
onAuth('logout', () => logout())

const BASE_RETRY = 100
const MAX_RETRY = 3000
let RETRY_TIME = 0

function createSocket() {
  const base = config.apiUrl
    .replace('http://', 'ws://')
    .replace('https://', 'wss://')
  const ws = new WebSocket(base + '/')

  ws.onopen = () => {
    state.connected = true
    RETRY_TIME = 0
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
        for (const [, listener] of persistentListeners.entries()) {
          listener(data)
        }
      } catch (ex) {}
    }
  }

  ws.onclose = () => {
    state.connected = false
    state.wsAuthed = false

    RETRY_TIME = RETRY_TIME === 0 ? BASE_RETRY : RETRY_TIME * 2

    if (RETRY_TIME > MAX_RETRY) RETRY_TIME = MAX_RETRY

    setTimeout(() => {
      socket = createSocket()
    }, RETRY_TIME)
  }

  ws.onerror = (_error: any) => {
    state.connected = false
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

  if (token) state.wsAuthed = true
}

function send(payload: string) {
  socket.send(payload)
}

function logout() {
  const message = {
    type: 'logout',
  }
  const payload = JSON.stringify(message)
  send(payload)
  state.wsAuthed = false
}

function subscribe<T extends SocketMsg['type']>(
  condition: Condition<T>,
  timeoutSecs?: number
) {
  return new Promise<ExtractMsg<T>>((resolve, reject) => {
    const timer = timeoutSecs ? setTimeout(() => reject('Timeout')) : undefined
    // TODO: Can timeout here by calling reject in setTimeout then remove the listener
    const id = ++currentId

    listeners.set(id, {
      condition,
      callback: msg => {
        resolve(msg as any)
        clearTimeout(timer)
      },
    })
  })
}

const persistentListeners = new Map<number, any>()
let persistId = 0
function on(cb: (msg: SocketMsg) => any) {
  const id = ++persistId
  persistentListeners.set(id, cb)
  return id
}

function remove(id: number) {
  persistentListeners.delete(id)
}

export const webSockets = { subscribe, on, remove }

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
