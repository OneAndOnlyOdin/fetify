import { state } from './auth'
import { config } from '../env'

const baseUrl = config.apiUrl

export const api = {
  get,
  post
}

async function get<T>(path: string, query?: any) {
  const params = Object.keys(query)
    .map(key => `${key}=${query[key]}`)
    .join('&')

  const res = await fetch(`${baseUrl}${path}?${params}`, {
    method: 'get',
    ...headers()
  })

  const json = await res.json()
  if (res.status >= 400) {
    const error: any = new Error(res.statusText)
    error.status = res.status
    error.message = json.message
    throw error
  }

  return json as T
}

async function post<T>(path: string, body = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'post',
    body: JSON.stringify(body),
    ...headers()
  })

  const json = await res.json()
  if (res.status >= 400) {
    const error: any = new Error(res.statusText)
    error.status = res.status
    error.message = json.message
    throw error
  }

  return json as T
}

function headers() {
  const headers: any = {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }

  if (!state.token) {
    return { headers }
  }

  headers.Authorization = `Bearer ${state.token}`
  return { headers }
}
