const FLAG_OFFSET = 127397
export const countryFlag = (code: string): string =>
  code.toUpperCase().split('').map(c => String.fromCodePoint(c.charCodeAt(0) + FLAG_OFFSET)).join('')
