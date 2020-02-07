export const config = {
  apiUrl: process.env.API_URL || window.location.origin,
}

console.log(config)

const baseIsLocal = config.apiUrl.includes('127.0.0.1') || config.apiUrl.includes('localhost')
const originIsRemote =
  !window.location.hostname.includes('127.0.0.1') && !window.location.hostname.includes('localhost')

if (originIsRemote && baseIsLocal) {
  config.apiUrl = config.apiUrl
    .replace('127.0.0.1', window.location.hostname)
    .replace('localhost', window.location.hostname)
}
