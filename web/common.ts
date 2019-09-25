function formatDate(value: string | number | Date) {
  const date = new Date(value)

  return date.toLocaleString()
}

function toDuration(valueSecs: number) {
  const now = Math.floor(new Date(valueSecs).valueOf() / 1000)
  const diff = Math.abs(now - valueSecs)
  const {
    duration: [days, hours, minutes, seconds],
  } = toRawDuration(diff)

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

const ONE_HOUR = 3600
const ONE_DAY = 86400

type Duration = [number, number, number, number]

function toRawDuration(valueSecs: number) {
  const days = Math.floor(valueSecs / ONE_DAY)
  const hours = Math.floor(valueSecs / ONE_HOUR) % 24
  const mins = Math.floor(valueSecs / 60) % 60
  const secs = valueSecs % 60

  return {
    duration: [days, hours, mins, secs] as Duration,
    seconds: valueSecs,
    text:
      valueSecs <= 0
        ? 'now'
        : `${days}d:${hours}h:${mins}m:${secs}s`.replace('0d:', ''),
  }
}

export const common = { formatDate, toDuration, toRawDuration }
