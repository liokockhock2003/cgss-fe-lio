import humanFormat, { Options, ScaleLike } from 'human-format'
import { flow, get } from 'lodash-es'

type d = { minimumFractionDigits: number; maximumFractionDigits: number }
const intlDecimal = (format: d = { minimumFractionDigits: 2, maximumFractionDigits: 2 }, locale = 'en-US') =>
  new Intl.NumberFormat(locale, { style: 'decimal', ...format })

// suitable for long number
export const valueFormatter = (value: number, ...format: Parameters<typeof intlDecimal>) =>
  intlDecimal(...format).format(value)

// suitable for dashboard
export const valueToHumanFormatter = (value: number, opts?: Options<ScaleLike>) => humanFormat(value, opts)

export const pickValueFormatter = (path: string, defaultValue = 0) =>
  flow((_) => get(_, path, defaultValue), valueFormatter)

export const inActiveClass =
  'dark:text-gray-700 text-gray-300 cursor-not-allowed pointer-events-none [&_*]:text-[var(--color-gray-700)]'
