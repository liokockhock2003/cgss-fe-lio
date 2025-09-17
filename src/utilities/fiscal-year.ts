export function getSequenceOFiscalMonths(startMonth: number) {
  // Generate 12 months starting from the startMonth
  return [...Array(12)].map((_, i) => ((startMonth + i - 1) % 12) + 1)
}
