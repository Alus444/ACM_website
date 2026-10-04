import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { compile, parse as parseTemplate } from '@vue/compiler-dom'
import { parse as parseSfc } from '@vue/compiler-sfc'
import { renderToString } from '@vue/server-renderer'
import * as Vue from 'vue'
import PhraseText from '../src/components/PhraseText.ts'
import { splitPhrases } from '../src/utils/phraseWrap.ts'
import { phraseTextTransform } from '../build/phraseTextTransform.ts'

const cases = [
  '撮影・ディレクション・編集業務',
  'モデリング・アニメーション基礎・ゲーム制作の指導',
  '「プリセット」を選び、プレビューで確認します。',
  'ブルーム、ギミック、インストール',
  'ブラウン管テレビで表示を確認します。',
  'ACM Editor Tools / VRChat / 3DCG / Vket2025 / PF-526',
  'alus@ac-md.com @Alus_ND 0.9.48',
  '初期値 -1.5〜2.5 ms、0–100%、¥12,000〜',
  '一行目\n二行目\n\n末尾。',
  '  前後の空白\tも保持  ',
  '説明 <script>alert("x")</script> & 引用',
  '幅より長いオリジナルビジネスタイガーサミット',
  '',
]
for (const text of cases) assert.equal(splitPhrases(text).join(''), text, 'Text must be preserved')
for (const word of ['ディレクション', 'モデリング', 'プリセット', 'プレビュー', 'ブルーム', 'ギミック', 'ブラウン管', '3DCG', 'Vket2025', 'PF-526', '-1.5〜2.5 ms', 'alus@ac-md.com', '@Alus_ND', '0.9.48']) {
  assert.ok(splitPhrases(`前文。${word}を確認します。`).some(part => part.includes(word)), `Split word: ${word}`)
}
const punctuation = splitPhrases('「プリセット」を選び、表示します。')
assert.ok(punctuation.includes('「プリセット」を'))
assert.ok(punctuation.every(part => !/^[、。）」]/u.test(part)), 'Closing punctuation must stay with previous text')

function compileComponent(template, data = {}) {
  const { code } = compile(template, { prefixIdentifiers: true, nodeTransforms: [phraseTextTransform] })
  return { data: () => data, render: new Function('Vue', code)(Vue) }
}
async function render(template, data) {
  const app = Vue.createSSRApp(compileComponent(template, data))
  app.component('PhraseText', PhraseText)
  return renderToString(app)
}
const html = await render('<p>{{bio}}<br><strong>プリセット</strong><code>{{path}}</code></p>', {
  bio: '撮影・ディレクション', path: '%USERPROFILE%\\Documents\\NIGHTOVER',
})
assert.match(html, /class="phrase-unit">ディレクション<\/span>/u)
assert.match(html, /<br>/u)
assert.match(html, /<strong><acm-text/u)
assert.match(html, /<code>%USERPROFILE%\\Documents\\NIGHTOVER<\/code>/u)
assert.ok(!html.includes('aria-hidden'), 'Text must remain readable to assistive technology')
const skipped = await render('<pre>プリセット {{value}}</pre><svg><text>図</text></svg><div data-wrap="off">既存表示</div><div contenteditable>編集</div><select><option>選択</option></select>', {value:'コード'})
assert.ok(!skipped.includes('acm-text'))
const list = await render('<ul><li v-for="item in items" :key="item">{{item}}</li></ul><p v-if="visible">{{name}}</p>', {items:['プリセット','ディレクション'],visible:true,name:'名前'})
assert.equal((list.match(/<li>/g) ?? []).length, 2)
assert.ok(list.includes('ディレクション'))
assert.ok(list.includes('名前'))
const escaped = await render('<p>{{value}}</p>', {value:'<img src=x onerror=alert(1)>'})
assert.ok(!escaped.includes('<img'), 'Interpolation must stay escaped')
const combined = await render('<p>Ver.{{version}}</p><p v-for="item in items">作品{{item.id}}版</p>', {version:'0.9.48',items:[{id:12}]})
assert.match(combined, /class="phrase-unit">Ver\.0\.9\.48<\/span>/u)
assert.ok(combined.includes('作品'))
assert.ok(combined.includes('12'))
assert.ok(!combined.includes('undefined'))
const mixedPunctuation = await render('<p><code>project.json</code>、保存先です。</p>')
assert.match(mixedPunctuation, /<\/code><acm-text[^>]*>、<span/u)

// Compile every existing SFC using the same transform, including large docs,
// rather than checking only a toy template.
import { glob } from 'node:fs/promises'
let compiled = 0
for await (const path of glob('src/**/*.vue')) {
  const { descriptor } = parseSfc(await readFile(path, 'utf8'), { filename: path })
  if (!descriptor.template) continue
  const ast = parseTemplate(descriptor.template.content)
  compile(ast, { mode: 'module', nodeTransforms: [phraseTextTransform], expressionPlugins: ['typescript'] })
  compiled++
}
console.log(`Phrase wrapping: ${cases.length} preservation cases, word/punctuation/escaping/exclusion/list checks, ${compiled} SFCs passed.`)
