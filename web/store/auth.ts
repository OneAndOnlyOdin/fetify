import * as jwt from 'jsonwebtoken'

export type AuthState = {
  connected: boolean
  wsAuthed: boolean
  loggedIn: boolean
  userId: string
  token?: string
  alias?: string
  email?: string
}

export const state: AuthState = {
  connected: false,
  loggedIn: false,
  wsAuthed: false,
  userId: '',
}

hydrateToken()

export function logout() {
  localStorage.removeItem('state')
  state.loggedIn = false
  state.userId = ''

  delete state.alias
  delete state.email
  delete state.token

  for (const callback of listeners.logout) {
    callback()
  }
}

export function handleToken(token: string, isLogin?: boolean) {
  localStorage.setItem('state', token)
  const payload = jwt.decode(token) as AuthToken
  state.token = token
  state.loggedIn = true
  state.userId = payload.userId
  state.alias = payload.alias
  state.email = payload.email

  if (isLogin) {
    for (const callback of listeners.login) {
      callback()
    }
  }
}

function hydrateToken() {
  const token = localStorage.getItem('state')
  if (!token) return

  handleToken(token)
}

const listeners = {
  login: new Array<() => void>(),
  logout: new Array<() => void>(),
}

export function onAuth(ev: keyof typeof listeners, cb: () => void) {
  listeners[ev].push(cb)
}
