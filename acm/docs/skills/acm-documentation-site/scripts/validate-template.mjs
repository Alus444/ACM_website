import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import ts from 'typescript'
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc'

const skillRoot = path.resolve(import.meta.dirname, '..')
const rawArgs = process.argv.slice(2)
const args = {}
for (let index = 0; index < rawArgs.length; index += 2) {
  const key = rawArgs[index]
  const value = rawArgs[index + 1]
  if (!key?.startsWith('--') || !value) {
    process.stderr.write('Usage: validate-template.mjs [--page file.vue --data file.ts --router index.ts]\n')
    process.exit(2)
  }
  args[key.slice(2)] = value
}

const customFiles = Boolean(args.page || args.data || args.router)
if (customFiles && (!args.page || !args.data)) {
  process.stderr.write('--page and --data must be provided together.\n')
  process.exit(2)
}

const vuePath = path.resolve(args.page ?? path.join(skillRoot, 'assets', 'ProductDocumentationPage.template.vue'))
const dataPath = path.resolve(args.data ?? path.join(skillRoot, 'assets', 'product-documentation.template.ts'))
const modulesPath = path.join(skillRoot, 'assets', 'product-documentation.modules.template.ts')
const vueSource = fs.readFileSync(vuePath, 'utf8')
const dataSource = fs.readFileSync(dataPath, 'utf8')
const modulesSource = fs.readFileSync(modulesPath, 'utf8')
const failures = []

for (const [file, source] of [[vuePath, vueSource], [dataPath, dataSource], [modulesPath, modulesSource]]) {
  if (/\bTODO\b|\[TODO/i.test(source)) failures.push(`${file}: unfinished placeholder`)
}

if (customFiles) {
  if (/PRODUCT NAME|slug:\s*['"]product-name['"]|currentVersion:\s*['"]0\.0\.0['"]/.test(dataSource)) {
    failures.push(`${dataPath}: unresolved product placeholder`)
  }

  const importMatch = vueSource.match(/from\s+['"](\.\.\/data\/[^'"]+)['"]/) || null
  if (!importMatch) {
    failures.push(`${vuePath}: product data import was not found`)
  } else {
    const importedDataPath = path.resolve(path.dirname(vuePath), `${importMatch[1]}.ts`)
    if (path.normalize(importedDataPath) !== path.normalize(dataPath)) {
      failures.push(`${vuePath}: data import resolves to ${importedDataPath}, not ${dataPath}`)
    }
  }

  const ids = [...dataSource.matchAll(/\bid:\s*['"]([^'"]+)['"]/g)].map((match) => match[1])
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))]
  if (duplicates.length) failures.push(`${dataPath}: duplicate ids: ${duplicates.join(', ')}`)
}

const parsed = parse(vueSource, { filename: vuePath })
for (const error of parsed.errors) failures.push(`${vuePath}: ${String(error)}`)

if (parsed.descriptor.scriptSetup) {
  try {
    compileScript(parsed.descriptor, { id: 'acm-product-doc-template' })
  } catch (error) {
    failures.push(`${vuePath}: script compile failed: ${String(error)}`)
  }
}

if (parsed.descriptor.template) {
  const result = compileTemplate({
    id: 'acm-product-doc-template',
    filename: vuePath,
    source: parsed.descriptor.template.content,
    scoped: parsed.descriptor.styles.some((style) => style.scoped),
  })
  for (const error of result.errors) failures.push(`${vuePath}: template compile failed: ${String(error)}`)
}

const dataResult = ts.transpileModule(dataSource, {
  fileName: dataPath,
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  reportDiagnostics: true,
})
for (const diagnostic of dataResult.diagnostics ?? []) {
  failures.push(`${dataPath}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`)
}

const modulesResult = ts.transpileModule(modulesSource, {
  fileName: modulesPath,
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  reportDiagnostics: true,
})
for (const diagnostic of modulesResult.diagnostics ?? []) {
  failures.push(`${modulesPath}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`)
}

if (args.router) {
  const routerPath = path.resolve(args.router)
  const routerSource = fs.readFileSync(routerPath, 'utf8')
  const slug = dataSource.match(/slug:\s*['"]([^'"]+)['"]/)?.[1]
  if (!slug) {
    failures.push(`${dataPath}: slug was not found`)
  } else {
    if (!routerSource.includes(`/${slug}/:page?`)) failures.push(`${routerPath}: product route /${slug}/:page? was not found`)
    const scrollBehaviorBody = routerSource.match(/scrollBehavior\s*\([^)]*\)\s*\{([\s\S]*?)\n\s*\},/)?.[1] ?? ''
    if (!scrollBehaviorBody.includes(`/${slug}`)) failures.push(`${routerPath}: documentation scroll exception for /${slug} was not found`)
  }
}

if (failures.length) {
  process.stderr.write(`${failures.join('\n')}\n`)
  process.exit(1)
}

process.stdout.write(`${customFiles ? 'Generated documentation files' : 'ACM documentation templates'} compile successfully.\n`)
