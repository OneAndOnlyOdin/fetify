import * as jwt from 'jsonwebtoken'
import { api } from './api'

export type AuthState = {
  loggedIn: boolean
  userId: string
  token?: string
  alias?: string
  email?: string
}

export const state: AuthState = {
  loggedIn: false,
  userId: ''
}

hydrateToken()

export async function register(username: string, password: string, confirm: string) {
  const token = await api.post<string>('/api/user/register', {
    username,
    password,
    confirm
  })

  handleToken(token)
}

export async function login(username: string, password: string) {
  const token = await api.post<string>('/api/user/login', {
    username,
    password
  })

  handleToken(token)
}

export function logout() {
  localStorage.removeItem('state')
  state.loggedIn = false
  state.userId = ''

  delete state.alias
  delete state.email
  delete state.token
}

function handleToken(token: string) {
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
