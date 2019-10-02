import { state, logout } from './auth'
import { config } from '../env'
import { authApi } from '.'

const baseUrl = config.apiUrl

export const api = {
  get,
  post,
}

type Query = { [key: string]: string | number }

async function get<T = void>(path: string, query: Query = {}) {
  const params = Object.keys(query)
    .map(key => `${key}=${query[key]}`)
    .join('&')

  const { result } = await callApi<T>(`${path}?${params}`, {
    method: 'get',
  })
  return result
}

async function post<T = void>(path: string, body = {}) {
  const { result } = await callApi<T>(path, {
    method: 'post',
    body: JSON.stringify(body),
  })
  return result
}

async function callApi<T = void>(
  path: string,
  opts: RequestInit,
  isRenew: boolean = false
): Promise<{ result: T; status: number }> {
  const res = await fetch(`${baseUrl}${path}`, { ...opts, ...headers() })
  const json = await res.json()

  if (res.status === 401) {
    if (isRenew) {
      logout()
      throw new StatusError('Unauthorized', 401)
    }

    // The API returns 'false' if the token is still valid
    const { result, status } = await callApi<string | false>(
      '/api/user/renew',
      { method: 'post' },
      true
    )

    if (status !== 200) {
      throw new StatusError('Unauthorized', 401)
    }

    // If we received a 401 and renewed successfully, it was unrelated to authentication
    if (result === false) {
      throw new StatusError('Unauthorized', 401)
    }

    authApi.handleToken(result)
    return callApi(path, opts)
  }

  if (res.status >= 400) {
    throw new StatusError(json.message || res.statusText, res.status)
  }

  return { result: json, status: res.status }
}

class StatusError extends Error {
  constructor(public msg: string, public status: number) {
    super(msg)
  }
}

function headers() {
  const headers: any = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }

  if (!state || !state.token) {
    return { headers }
  }

  headers.Authorization = `Bearer ${state.token}`
  return { headers }
}

setInterval(async () => {
  if (authApi.state.token) {
    const { result } = await callApi<string | false>('/api/user/renew', {
      method: 'post',
    })
    if (result !== false) authApi.handleToken(result)
  }
}, 1800000)
