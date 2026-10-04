/**
 * Normalize actual CRLF/CR and literal backslash-n/backslash-r-backslash-n to LF.
 * Preserve all other characters, including whitespace and unrelated escapes.
 * @param {string} value
 * @returns {string}
 */
export function normalizeNewlines(value) {
  if (typeof value !== 'string') {
    throw new TypeError('normalizeNewlines expects a string.')
  }

  return value.replace(/\\r\\n|\\n|\r\n?/g, '\n')
}
