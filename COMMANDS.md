# よく使うコマンド

## ローカルで確認する

```bash
cd c:/Users/Alus/Documents/ACM_website/acm
npm run dev
```
→ http://localhost:5173 で確認

## BOOTHデータを更新する

```bash
cd c:/Users/Alus/Documents/ACM_website/acm
node scripts/fetch-booth.mjs
```
→ `booth-urls.json` に書いたURLから自動取得・画像ダウンロード

## 本番サイトに反映する（push）

```bash
cd c:/Users/Alus/Documents/ACM_website
git add .
git commit -m "変更内容のメモ"
git push origin main
```
→ GitHub Actions が自動でビルド＆デプロイ → https://ac-md.com に反映

## 工事中ページの切り替え

`acm/src/App.vue` の1行を変えるだけ：

```ts
const underConstruction = true   // ← 工事中
const underConstruction = false  // ← 通常ページ
```

## BOOTHの商品を追加する

`acm/booth-urls.json` にURLを追加してスクリプトを実行：

```json
{ "url": "https://alushop.booth.pm/items/XXXXXXX", "category": "カテゴリ名" }
```

```bash
npm run fetch-booth
# または
node scripts/fetch-booth.mjs
```

既存商品も含めて全件再取得したい場合：

```bash
npm run fetch-booth:force
# または
node scripts/fetch-booth.mjs --force
```

→ booth.ts を一から上書き（タイトル・価格・説明が変わったときに使う）

## MOVIE（YouTube動画）を追加する

`acm/src/data/movies.ts` に動画を追加：

```ts
{
  youtubeId: 'ABC123xyz',  // YouTubeのURLの ?v= 以降の部分
  title: '動画タイトル',
  year: 2024,              // 省略可
  tags: ['MV', '3DCG'],    // 省略可
  description: '説明文',   // 省略可
}
```

YouTubeのURL例：`https://www.youtube.com/watch?v=ABC123xyz` → `youtubeId: 'ABC123xyz'`


再生リストから一括取得 yt-dlp

yt-dlp --no-flat-playlist --print "[%(title)s/%(release_date>%Y,release_timestamp>%Y,upload_date>%Y,timestamp>%Y|NA)s/https://www.youtube.com/watch?v=%(id)s]" "https://youtube.com/playlist?list=PL55eIGMVE7ZxUKaLp5E1VEEsEXyStFXDk&si=YweZseooJpHqNooN"