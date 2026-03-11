import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join, extname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const imgDir = join(root, 'public/images/booth')

mkdirSync(imgDir, { recursive: true })

const urlList = JSON.parse(readFileSync(join(root, 'booth-urls.json'), 'utf-8'))

function extractMeta(html, property) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
  ]
  for (const re of patterns) {
    const m = html.match(re)
    if (m) return m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'")
  }
  return ''
}

function cleanTitle(raw) {
  return raw.split(' - ')[0].trim()
}

function cleanDescription(raw) {
  const clean = raw.replace(/https?:\/\/\S+/g, '').replace(/\s{2,}/g, ' ').trim()
  return clean.length > 80 ? clean.slice(0, 77) + '...' : clean
}

function extractPrice(html) {
  const ldMatch = html.match(/"price"\s*:\s*"?([\d.]+)"?/)
  if (ldMatch) return Math.round(parseFloat(ldMatch[1]))
  const spanMatch = html.match(/class="[^"]*price[^"]*"[^>]*>\s*[\¥￥]?([\d,]+)/)
  if (spanMatch) return parseInt(spanMatch[1].replace(/,/g, ''), 10)
  return 0
}

async function downloadImage(imageUrl, itemId) {
  if (!imageUrl) return ''
  try {
    const ext = extname(new URL(imageUrl).pathname) || '.jpg'
    const filename = `booth-${itemId}${ext}`
    const dest = join(imgDir, filename)

    const res = await fetch(imageUrl, {
      headers: { 'Referer': 'https://booth.pm/' }
    })
    if (!res.ok) return ''

    const buf = await res.arrayBuffer()
    writeFileSync(dest, Buffer.from(buf))
    console.log(`  saved: /images/booth/${filename}`)
    return `/images/booth/${filename}`
  } catch {
    return ''
  }
}

async function fetchItem(entry) {
  const { url, category } = entry
  console.log(`Fetching: ${url}`)

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0',
      'Accept-Language': 'ja,en;q=0.9',
    },
  })

  if (!res.ok) {
    console.warn(`  Failed: ${res.status}`)
    return null
  }

  const html = await res.text()
  const id = url.match(/\/items\/(\d+)/)?.[1] ?? url

  const title = cleanTitle(extractMeta(html, 'og:title'))
  const remoteImage = extractMeta(html, 'og:image') || extractMeta(html, 'twitter:image')
  const description = cleanDescription(extractMeta(html, 'og:description'))
  const price = extractPrice(html)
  const imageUrl = await downloadImage(remoteImage, id)

  console.log(`  title: ${title}`)
  console.log(`  price: ${price}`)

  return { id: `booth-${id}`, title, description, imageUrl, price, boothUrl: url, category }
}

async function main() {
  const items = []

  for (const entry of urlList) {
    const item = await fetchItem(entry)
    if (item) items.push(item)
    await new Promise(r => setTimeout(r, 800))
  }

  const ts = `import type { BoothItem } from '../types'

// このファイルは scripts/fetch-booth.mjs で自動生成されます
export const boothItems: BoothItem[] = ${JSON.stringify(items, null, 2)}
`

  writeFileSync(join(root, 'src/data/booth.ts'), ts, 'utf-8')
  console.log(`\nGenerated booth.ts with ${items.length} items.`)
}

main().catch(e => { console.error(e); process.exit(1) })
