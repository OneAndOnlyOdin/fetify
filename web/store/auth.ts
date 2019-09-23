import * as jwt from 'jsonwebtoken'
import { api } from './api'

export type AuthState = {
  loggedIn: boolean
  username: string
  token?: string
  alias?: string
  email?: string
}

export const state: AuthState = {
  loggedIn: false,
  username: ''
}

export async function register(
  username: string,
  password: string,
  confirm: string
) {
  const token = await api.post<string>('/api/user/register', {
    username,
    password,
    confirm
  })
  state.loggedIn = true
  state.token = token

  state.username = username
}

export async function login(username: string, password: string) {
  const token = await api.post<string>('/api/user/login', {
    username,
    password
  })
  state.loggedIn = true
  handleToken(token)
}

function handleToken(token: string) {
  const payload = jwt.decode(token) as any
  state.alias = payload.alias
  state.email = payload.email
}
