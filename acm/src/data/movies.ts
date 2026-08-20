import type { Movie } from '../types'

export const movies: Movie[] = [
  { youtubeId: 'Kq8p2Q2kHfg', title: '【ボイチェンおじさん】スペースさんま【歌ってみた】', tags: ['MV'], year: 2021, date: '2021-10-29' },
  { youtubeId: 'mCjloHCSG9I', title: 'CODE：LoveCall／304号室の木村さん【#VocaDuo2024】', tags: ['MV'], year: 2024, date: '2024-07-07' },
  { youtubeId: 'wy72DBUQdok', title: 'ポピ横の狂人 ながるcover', tags: ['MV'], year: 2021, date: '2021-01-11' },
  { youtubeId: 'oKx3Pcimh_8', title: "芹井りせとのスタジオセッション『サクレ』- てれかす × わすわす", tags: ['MV'], year: 2022, date: '2022-10-06' },
  { youtubeId: '6rxgBFwcdYY', title: 'プロポーズ -内緒のピアス／covered by 水縹アオ', tags: ['MV'], year: 2024, date: '2024-06-30' },
  { youtubeId: 'rk8TZ5CUJu8', title: 'ビードロ模様／covered by 水縹アオ(アニメ『あの夏で待ってる』EDテーマ)', tags: ['MV'], year: 2024, date: '2024-08-31' },
  { youtubeId: '7MN22Ah5EHM', title: '打上花火／covered by 白熊くらうど × 水縹アオ【もぐもぐ水族館】', tags: ['MV'], year: 2024, date: '2024-09-30' },
  { youtubeId: 'GX8_G3ois14', title: "【総集編】Ao Mihanada's Cover Song 1 Year Anniversary！【歌ってみた】", tags: ['MV'], year: 2024, date: '2024-02-16' },
  { youtubeId: '0mB0pt1uaBU', title: '人マニア／covered by 水縹アオ', tags: ['MV'], year: 2024, date: '2024-03-31' },
  { youtubeId: '2rxckpmbdoo', title: 'マーシャルマキシマイザー歌ってみた【ながる】', tags: ['MV'], year: 2022, date: '2022-04-08' },
  { youtubeId: 'rdRZ1AkJ8ys', title: 'ダーリン -須田景凪／covered by 水縹アオ', tags: ['MV'], year: 2025, date: '2025-07-31' },
  { youtubeId: 'TeXRfxSnu_g', title: '【ボイチェンおじさん】ホワイトハッピー【歌ってみた】', tags: ['MV'], year: 2021, date: '2021-08-20' },
  { youtubeId: 'a9BYP7UwoQ8', title: '【ボイチェンおじさん】東京ヒートアイランド現象【歌ってみた】', tags: ['MV'], year: 2021, date: '2021-07-31', thumbnailUrl: 'https://img.youtube.com/vi/a9BYP7UwoQ8/sddefault.jpg' },
  { youtubeId: 'vo15yW60QFs', title: '爆笑　歌ってみた【wanida】', tags: ['MV'], year: 2022, date: '2022-02-13' },
  { youtubeId: '2iEX-Kbw7Og', title: 'ライカ -yamada／covered by 水縹アオ', tags: ['MV'], year: 2025, date: '2025-03-31' },
  { youtubeId: 'OBbDgXkpMdA', title: 'いろは唄 /羽原ゆとり(Cover)', tags: ['MV'], year: 2022, date: '2022-01-17' },
  { youtubeId: 'L1kTLTsaVxU', title: '醒覚/結月ゆかり', tags: ['MV'], year: 2021, date: '2021-03-06' },
  { youtubeId: '9rTYbJ1bZpU', title: '夕焼 / 空想カスケード feat.紲星あかり', tags: ['MV'], year: 2021, date: '2021-05-16' },
  { youtubeId: 'y9b_DYIar-M', title: '雨き声残響 / 綺月七夕香【歌ってみた】', tags: ['MV'], year: 2022, date: '2022-07-06' },
  { youtubeId: '70VVzdpzl2M', title: 'メルティランドナイトメア／covered by 水縹アオ', tags: ['MV'], year: 2024, date: '2024-12-30' },
  { youtubeId: 'PxlnkFPGukA', title: "【活動5周年】アクアテラリウム／covered by 水縹アオ【TVアニメ『凪のあすから』EDテーマ】", tags: ['MV'], year: 2025, date: '2025-08-07' },
  { youtubeId: 'hRTMYEKU2OE', title: 'ずうっといっしょ！／covered by 水縹アオ', tags: ['MV'], year: 2024, date: '2024-10-31' },
  { youtubeId: 'bzU_y84QVag', title: '再会 -はるまきごはん／covered by 水縹アオ', tags: ['MV'], year: 2026, date: '2026-01-31' },
  { youtubeId: '2UixFWiWShc', title: '【歌ってみた】GURU　-cover-すずやっこ', tags: ['MV'], year: 2026, date: '2026-06-20' },
  { youtubeId: '-VbE7fxVhak', title: '【活動6周年】れびてーしょん／covered by 水縹アオ【TVアニメ『NEEDY GIRL OVERDOSE』EDテーマ】', tags: ['MV'], year: 2026, date: '2026-08-07' },
  { youtubeId: 'ESQoefo3Vrw', title: 'MusicVket3「Show you!」/クロスフェード', tags: ['MV'], year: 2021, date: '2021-11-03' },
  { youtubeId: 'K_4jydZH-S0', title: 'MusicVket2「ISSUE」/クロスフェード', tags: ['MV'], year: 2021, date: '2021-02-26' },
]

const getMovieSortKey = (movie: Movie) =>
  movie.date ?? (movie.year ? `${movie.year.toString().padStart(4, '0')}-00-00` : '')

export const sortMoviesByDateDesc = (items: readonly Movie[]) =>
  [...items].sort((a, b) => getMovieSortKey(b).localeCompare(getMovieSortKey(a)))
