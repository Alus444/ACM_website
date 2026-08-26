import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

process.on('uncaughtException', (error) => {
  process.stderr.write(`Scaffold failed: ${error instanceof Error ? error.message : String(error)}\n`)
  process.exit(1)
})

function parseArgs(argv) {
  const result = {}
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index]
    if (!key.startsWith('--')) throw new Error(`Unexpected argument: ${key}`)
    const value = argv[index + 1]
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${key}`)
    result[key.slice(2)] = value
    index += 1
  }
  return result
}

const args = parseArgs(process.argv.slice(2))
const slug = args.slug
const componentName = args.component
const dataName = args.data
const productName = args.name
const version = args.version
const projectRoot = path.resolve(args.root ?? process.cwd())

if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  throw new Error('--slug must be lowercase kebab-case, for example grain-lab')
}
if (!componentName || !/^[A-Z][A-Za-z0-9]*Page$/.test(componentName)) {
  throw new Error('--component must be a PascalCase name ending in Page, for example GrainLabPage')
}
if (!dataName || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(dataName)) {
  throw new Error('--data must be lowercase kebab-case, for example grain-lab')
}
if (!productName?.trim()) throw new Error('--name is required')
if (!version?.trim()) throw new Error('--version is required; use a verified product version')

const pagesDir = path.join(projectRoot, 'src', 'pages')
const dataDir = path.join(projectRoot, 'src', 'data')
if (!fs.existsSync(path.join(projectRoot, 'package.json')) || !fs.existsSync(pagesDir) || !fs.existsSync(dataDir)) {
  throw new Error(`Project root does not look like ACM_website/acm: ${projectRoot}`)
}

const skillRoot = path.resolve(import.meta.dirname, '..')
const pageTemplatePath = path.join(skillRoot, 'assets', 'ProductDocumentationPage.template.vue')
const dataTemplatePath = path.join(skillRoot, 'assets', 'product-documentation.template.ts')
const pageTarget = path.join(pagesDir, `${componentName}.vue`)
const dataTarget = path.join(dataDir, `${dataName}.ts`)

for (const target of [pageTarget, dataTarget]) {
  if (fs.existsSync(target)) throw new Error(`Refusing to overwrite existing file: ${target}`)
}

const pageSource = fs.readFileSync(pageTemplatePath, 'utf8')
  .replace("../data/product-documentation", `../data/${dataName}`)
const dataSource = fs.readFileSync(dataTemplatePath, 'utf8')
  .replace("slug: 'product-name'", `slug: ${JSON.stringify(slug)}`)
  .replace("productName: 'PRODUCT NAME'", `productName: ${JSON.stringify(productName)}`)
  .replace("currentVersion: '0.0.0'", `currentVersion: ${JSON.stringify(version)}`)
  .replace("titleSuffix: 'PRODUCT NAME'", `titleSuffix: ${JSON.stringify(productName)}`)

fs.writeFileSync(pageTarget, pageSource, 'utf8')
fs.writeFileSync(dataTarget, dataSource, 'utf8')

process.stdout.write([
  `Created ${pageTarget}`,
  `Created ${dataTarget}`,
  '',
  'Add the component import and route to src/router/index.ts:',
  `  import ${componentName} from '../pages/${componentName}.vue'`,
  `  { path: '/${slug}/:page?', component: ${componentName}, meta: { standalone: true, title: '${productName} — ドキュメント' } }`,
  `Also add '/${slug}' to the documentation-path condition in scrollBehavior.`,
].join('\n') + '\n')
