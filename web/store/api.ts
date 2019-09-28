import { state, logout } from './auth'
import { config } from '../env'
import { auth } from '.'

const baseUrl = config.apiUrl

export const api = {
  get,
  post,
}

type Query = { [key: string]: string | number }

async function get<T>(path: string, query: Query = {}) {
  const params = Object.keys(query)
    .map(key => `${key}=${query[key]}`)
    .join('&')

  return callApi<T>(`${path}?${params}`, {
    method: 'get',
  })
}

async function post<T>(path: string, body = {}) {
  return callApi<T>(path, {
    method: 'post',
    body: JSON.stringify(body),
  })
}

async function callApi<T>(
  path: string,
  opts: RequestInit,
  isRenew: boolean = false
): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, { ...opts, ...headers() })
  const json = await res.json()

  if (res.status === 401) {
    if (isRenew) {
      logout()
      throw new StatusError('Unauthorized', 401)
    }

    // The API returns 'false' if the token is still valid
    const newToken = await callApi<string | false>(
      '/api/user/renew',
      { method: 'post' },
      true
    )

    if (newToken !== false) auth.handleToken(newToken)
    return callApi(path, opts)
  }

  if (res.status >= 400) {
    throw new StatusError(json.message || res.statusText, res.status)
  }

  return json
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

  if (!state.token) {
    return { headers }
  }

  headers.Authorization = `Bearer ${state.token}`
  return { headers }
}

const win: any = window
win.renew = () => {
  callApi('/api/user/renew', { method: 'post' }, true).then(console.log)
}
