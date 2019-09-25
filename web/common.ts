function formatDate(date: string | number | Date) {
  const time = new Date(date)

  return time.toLocaleString()
}

export const common = { formatDate }
