function persist(key: string, body: any) {
  localStorage.setItem(key, JSON.stringify(body))
}

function hydrate<T>(key: string): T | null {
  const result = localStorage.getItem(key)
  if (!result) return null

  return JSON.parse(result)
}

function formatDate(value: string | number | Date) {
  const date = new Date(value)

  return date.toLocaleString()
}

function toDuration(valueSecs: number, full?: boolean) {
  const now = Math.floor(new Date(valueSecs).valueOf() / 1000)
  const diff = Math.abs(now - valueSecs)

  const {
    duration: [days, hours, minutes, seconds],
  } = toRawDuration(diff)

  if (full) {
    return [`${days}d`, `${hours}h`, `${minutes}m`, `${seconds}s`]
      .filter(time => !time.startsWith('0'))
      .join(':')
  }

  if (days) {
    return `${days} days`
  }

  if (hours) {
    return `${hours} hours`
  }

  if (minutes) {
    return `${minutes} mins`
  }

  return `${seconds} seconds`
}

function elapsedSince(date: string | Date) {
  const elapsed = Math.floor((Date.now() - new Date(date).valueOf()) / 1000)
  if (elapsed < 60) return 'a moment'
  return toDuration(Math.floor(elapsed))
}

const ONE_HOUR = 3600
const ONE_DAY = 86400

type Duration = [number, number, number, number]

function toRawDuration(valueSecs: number) {
  const days = Math.floor(valueSecs / ONE_DAY)
  const hours = Math.floor(valueSecs / ONE_HOUR) % 24
  const mins = Math.floor(valueSecs / 60) % 60
  const secs = Math.ceil(valueSecs % 60)

  return {
    duration: [days, hours, mins, secs] as Duration,
    seconds: valueSecs,
    text:
      valueSecs <= 0
        ? 'now'
        : `${days}d:${hours}h:${mins}m:${secs}s`.replace('0d:', ''),
  }
}

export const common = {
  persist,
  hydrate,
  formatDate,
  toDuration,
  toRawDuration,
  elapsedSince,
}
