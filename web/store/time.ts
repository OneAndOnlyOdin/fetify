import { api } from './api'

const state = {
  server: new Date(),
  client: new Date(),
  ping: 0,
  offset: 0,
}

init()

export function getNow() {
  return new Date(Date.now() + state.offset)
}

async function init() {
  const now = Date.now()
  const status = await api.get<{ now: string }>('/api/healthcheck')
  const ping = (Date.now() - now) / 2

  state.ping = ping
  state.server = new Date(status.now)
  state.client = new Date()
  state.offset = state.server.valueOf() - (state.client.valueOf() - state.ping)
}
