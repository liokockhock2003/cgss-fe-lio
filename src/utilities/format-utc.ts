export function formatUTC(date: Date) {
  const day = date.getUTCDate()
  const monthIndex = date.getUTCMonth()
  const year = date.getUTCFullYear().toString().slice(-2)

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const getOrdinal = (n: number) => {
    if (n > 3 && n < 21) return 'th'
    switch (n % 10) {
      case 1:
        return 'st'
      case 2:
        return 'nd'
      case 3:
        return 'rd'
      default:
        return 'th'
    }
  }

  const ordinalDay = `${day}${getOrdinal(day)}`
  const monthName = monthNames[monthIndex]

  return `${ordinalDay} ${monthName} ${year}`
}
