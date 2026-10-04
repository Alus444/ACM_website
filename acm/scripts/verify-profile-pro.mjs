// Run: node --test scripts/verify-profile-pro.mjs
// Only synthetic PROFILE_PRO_JSON values are passed to isolated child processes.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { transpileModule, ModuleKind, ScriptTarget } from 'typescript'
import { normalizeNewlines } from '../src/utils/normalize-newlines.mjs'

const samples = [
  { name: 'actual LF and CRLF', input: '一行目\r\n二行目\n三行目', expected: '一行目\n二行目\n三行目' },
  { name: 'literal escaped newlines', input: String.raw`一行目\r\n二行目\n三行目`, expected: '一行目\n二行目\n三行目' },
  { name: 'mixed actual and escaped newlines', input: '一行目\r\n二行目\\n三行目\\r\\n四行目\n五行目', expected: '一行目\n二行目\n三行目\n四行目\n五行目' },
  { name: 'no newlines', input: String.raw`  改行なし "引用" C:\tools\video  `, expected: String.raw`  改行なし "引用" C:\tools\video  ` },
]

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'acm-profile-pro-'))
  t.after(() => {
    // Verify that recursive cleanup targets only this temporary fixture.
    assert.equal(dirname(root), resolve(tmpdir()))
    assert.ok(basename(root).startsWith('acm-profile-pro-'))
    rmSync(root, { recursive: true, force: true })
  })
  mkdirSync(join(root, 'scripts'))
  mkdirSync(join(root, 'src/data'), { recursive: true })
  mkdirSync(join(root, 'src/utils'))
  const script = join(root, 'scripts/gen-profile-pro.mjs')
  copyFileSync(fileURLToPath(new URL('./gen-profile-pro.mjs', import.meta.url)), script)
  copyFileSync(fileURLToPath(new URL('../src/utils/normalize-newlines.mjs', import.meta.url)), join(root, 'src/utils/normalize-newlines.mjs'))

  return {
    outPath: join(root, 'src/data/profile-pro.ts'),
    run(json) {
      return spawnSync(process.execPath, [script], {
        encoding: 'utf8',
        env: json === undefined ? {} : { PROFILE_PRO_JSON: json },
      })
    },
  }
}

async function readGeneratedProfile(outPath) {
  const source = readFileSync(outPath, 'utf8')
  const { outputText } = transpileModule(source, {
    compilerOptions: { module: ModuleKind.ESNext, target: ScriptTarget.ES2022 },
  })
  const jsPath = `${outPath}.mjs`
  writeFileSync(jsPath, outputText)
  return (await import(pathToFileURL(jsPath).href)).profilePro
}

for (const { name, input, expected } of samples) {
  test(`normalizes ${name} without losing text`, () => {
    assert.equal(normalizeNewlines(input), expected)
    assert.equal(normalizeNewlines(expected), expected)
  })

  test(`generator round trip: ${name}`, async (t) => {
    const { run, outPath } = fixture(t)
    const inputProfile = {
      name: '検証用プロフィール',
      handle: '@sample',
      avatarUrl: '/sample.png',
      bio: input,
      skills: ['Sample'],
      social: { email: 'sample@example.invalid' },
    }
    const json = JSON.stringify(inputProfile)
    assert.equal(JSON.parse(json).bio, input)
    const result = run(json)
    assert.equal(result.error, undefined)
    assert.equal(result.status, 0, result.stderr)
    assert.deepEqual(await readGeneratedProfile(outPath), {
      ...inputProfile,
      bio: expected,
      social: { email: 'sample@example.invalid', twitter: '', booth: '' },
    })
  })
}

test('preserves empty lines and leading/trailing whitespace; normalizes lone CR', () => {
  assert.equal(normalizeNewlines('  \r\n\\n本文\r末尾\\r\\n  '), '  \n\n本文\n末尾\n  ')
  assert.equal(normalizeNewlines(''), '')
})

test('rejects non-string input instead of silently generating an invalid bio', () => {
  for (const input of [undefined, null, 0, {}, []]) {
    assert.throws(() => normalizeNewlines(input), /normalizeNewlines expects a string\./)
  }
})

test('generator rejects missing/non-string bio before writing output', (t) => {
  const { run, outPath } = fixture(t)
  for (const bio of [undefined, null, 42, {}, []]) {
    const result = run(JSON.stringify({ name: 'Sample', bio }))
    assert.equal(result.error, undefined)
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /normalizeNewlines expects a string\./)
    assert.equal(existsSync(outPath), false)
  }
})

test('existing profile is skipped byte-for-byte even with invalid JSON input', (t) => {
  const { run, outPath } = fixture(t)
  const original = Buffer.from('// preserved fixture\r\nexport const profilePro = { bio: "original" }\r\n')
  writeFileSync(outPath, original)
  const result = run('deliberately invalid synthetic JSON')
  assert.equal(result.error, undefined)
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /already exists, skipping generation/)
  assert.deepEqual(readFileSync(outPath), original)
})

test('missing/empty input retains the existing placeholder behavior', async (t) => {
  for (const json of [undefined, '']) {
    const { run, outPath } = fixture(t)
    const result = run(json)
    assert.equal(result.error, undefined)
    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /placeholder generated/)
    assert.deepEqual(await readGeneratedProfile(outPath), {})
  }
})
