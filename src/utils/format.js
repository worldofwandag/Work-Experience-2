const LOCALE = 'en-GB'

export function formatMoney(amount, currency = 'USD') {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(value) {
  return new Intl.NumberFormat(LOCALE).format(value)
}

export function formatDate(value) {
  const date = value instanceof Date ? value : new Date(value)
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(value) {
  const date = value instanceof Date ? value : new Date(value)
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function initials(name) {
  if (!name) return ''
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`
}

export const PLAN_ORDER = ['Starter', 'Growth', 'Enterprise']

export function comparePlans(a, b) {
  return PLAN_ORDER.indexOf(a) - PLAN_ORDER.indexOf(b)
}
