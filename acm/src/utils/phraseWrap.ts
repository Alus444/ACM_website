// Keep spelling, whitespace and explicit newlines intact; only add wrap boundaries.
const segmenter = typeof Intl.Segmenter === 'function'
  ? new Intl.Segmenter('ja', { granularity: 'word' })
  : null
const protectedRun = /(?:[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|@[A-Za-z0-9_]+|-?\d+(?:\.\d+)?\s*[–〜~]\s*-?\d+(?:\.\d+)?(?:\s*(?:%|px|TVL|秒|行|ms|Hz))?|[\p{Script=Katakana}ー]+|[A-Za-z][A-Za-z0-9]*(?:[-_.’'][A-Za-z0-9]+)*|\d+[A-Za-z][A-Za-z0-9]*|[¥￥]?-?\d[\d,]*(?:\.\d+)*(?:%|px|TVL|秒|行|ms|Hz)?)/gu
const closing = /^[、。，．！？!?：:；;・〜）)］\]】」』〉》]+$/u
const opening = /^[（(［\[【「『〈《]+$/u
const particle = /^(?:は|が|を|に|へ|と|で|の|も|や|から|まで|より|など|です|ます|でした|ました)$/u

export function splitPhrases(text: string): string[] {
  const segments = segmenter
    ? [...segmenter.segment(text)].map(item => item.segment)
    : text.match(/[\p{Script=Han}]+|[\p{Script=Hiragana}]+|[A-Za-z0-9_]+|\s+|./gu) ?? []
  let offset = 0
  const boundaries = new Set(segments.map(word => offset += word.length))
  // Katakana compounds and numeric ranges remain intact even when the dictionary
  // recognizes smaller words within them. Remove existing boundaries instead of
  // segmenting substrings, which would split mixed words such as ブラウン管.
  for (const match of text.matchAll(protectedRun)) {
    for (const boundary of boundaries) {
      if (boundary > match.index && boundary < match.index + match[0].length) boundaries.delete(boundary)
    }
  }
  const words: string[] = []
  offset = 0
  for (const boundary of boundaries) {
    words.push(text.slice(offset, boundary))
    offset = boundary
  }

  const phrases: string[] = []
  let prefix = ''
  for (const word of words) {
    if (opening.test(word)) {
      prefix += word
      continue
    }
    const previous = phrases.at(-1)
    if (!prefix && previous && !/\s$/u.test(previous) && (closing.test(word) || particle.test(word))) {
      phrases[phrases.length - 1] += word
    } else {
      phrases.push(prefix + word)
      prefix = ''
    }
  }
  if (prefix) phrases.push(prefix)
  return phrases
}
