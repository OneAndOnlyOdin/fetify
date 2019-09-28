import * as jwt from 'jsonwebtoken'
import { router, navigate } from '../router'

export type AuthState = {
  connected: boolean
  loggedIn: boolean
  userId: string
  token?: string
  alias?: string
  email?: string
}

export const state: AuthState = {
  connected: false,
  loggedIn: false,
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
  router.currentRoute
  navigate('/')
}

export function handleToken(token: string) {
  localStorage.setItem('state', token)
  const payload = jwt.decode(token) as AuthToken
  state.token = token
  state.loggedIn = true
  state.userId = payload.userId
  state.alias = payload.alias
  state.email = payload.email
}

function hydrateToken() {
  const token = localStorage.getItem('state')
  if (!token) return

  handleToken(token)
}
