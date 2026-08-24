export type VhsNavItem = {
  id: string
  label: string
  description: string
  keywords: string
}

export type VhsNavGroup = {
  label: string
  items: VhsNavItem[]
}

export type VhsParameter = {
  id: string
  label: string
  labelEn: string
  range: string
  defaultValue: string
  mode: '操作' | '切替' | '両方' | '高精度' | '軽量時'
  role: string
  scopeLabel?: string
  guide?: string
  related?: string
  note?: string
}

export type VhsParameterGroup = {
  id: string
  page: string
  label: string
  eyebrow: string
  description: string
  condition?: string
  parameters: VhsParameter[]
}

export type VhsPresetSummary = {
  id: string
  name: string
  appearance: string
  use: string
}

export type VhsIssue = {
  id: string
  question: string
  answer: string
  keywords: string
}

export type VhsGlossaryTerm = {
  id: string
  term: string
  termEn: string
  description: string
  keywords: string
}

export type VhsGlossaryGroup = {
  label: string
  terms: VhsGlossaryTerm[]
}

export const vhsCurrentVersion = '2.10 beta'

export const vhsNavGroups: VhsNavGroup[] = [
  {
    label: 'はじめに',
    items: [
      { id: 'overview', label: '概要・対応環境', description: '再現範囲と動作環境', keywords: '概要 対応環境 after effects windows cuda directx cpu' },
      { id: 'install', label: 'インストール', description: '導入・更新・削除', keywords: 'インストール 更新 削除 media core aex' },
      { id: 'quick-start', label: '内蔵プリセット', description: '6種類の仕上がり', keywords: 'プリセット 種類 仕上がり' },
      { id: 'glossary', label: '用語集', description: 'CRT・TVL・RFなど', keywords: '用語 意味 crt ブラウン管 tvl ccd awb yc rf agc ドロップアウト トラッキング 同期' },
    ],
  },
  {
    label: 'ワークフロー',
    items: [
      { id: 'preview', label: '軽量・高精度', description: 'プレビュー品質の使い分け', keywords: '軽量 高精度 accurate preview render queue 停止' },
    ],
  },
  {
    label: 'パラメータ',
    items: [
      { id: 'parameters', label: '全項目早見表', description: '範囲と初期値の一覧', keywords: 'パラメータ 一覧 初期値 範囲' },
      { id: 'camera', label: '家庭用カメラ撮像', description: '家庭用カメラらしい画づくり', keywords: 'camera tvl awb ccd 色解像度 白飛び 黒つぶれ' },
      { id: 'vhs-signal', label: 'VHS信号・色', description: 'ぼけ・色にじみ・ダビング劣化', keywords: 'vhs signal yiq color under recording speed tvl rf' },
      { id: 'tape', label: 'テープ・走行故障', description: '揺れ・ノイズ・画面の崩れ', keywords: 'tape dropout tracking head clogging sync bottom noise' },
      { id: 'crt', label: 'CRT表示・最終出力', description: '走査線・発光・画面の丸み', keywords: 'crt scanline bloom shadow mask curvature frame mix' },
    ],
  },
  {
    label: '運用とサポート',
    items: [
      { id: 'troubleshooting', label: '診断・トラブル対応', description: '症状別の確認と対処', keywords: '診断 トラブル 変化しない 出ない gpu 日本語 文字化け' },
    ],
  },
]

export const vhsParameterGroups: VhsParameterGroup[] = [
  {
    id: 'built-in-presets',
    page: 'quick-start',
    label: 'プリセット',
    eyebrow: 'WORKFLOW',
    description: '内蔵プリセットの適用。',
    parameters: [
      { id: 'preset', label: '適用するプリセット', labelEn: 'Preset to Apply', range: '未選択＋6種類', defaultValue: '未選択', mode: '操作', role: '選ぶと、その仕上がりに合う基準値を各項目へまとめて設定します。', note: '適用後の描画は、画面に表示される各項目の値だけで決まります。' },
    ],
  },
  {
    id: 'preview-controls',
    page: 'preview',
    label: 'プレビュー品質',
    eyebrow: 'WORKFLOW',
    description: '編集中の表示品質。',
    parameters: [
      { id: 'preview-quality', label: 'プレビュー品質', labelEn: 'Preview Quality', range: '軽量／高精度', defaultValue: '高精度', mode: '切替', role: '軽量は再生を軽くし、高精度は細かなノイズや信号の崩れまで表示します。', guide: '動きの確認は軽量、質感の確認と最終出力は高精度。' },
      { id: 'accurate-when-stopped', label: '停止時は高精度', labelEn: 'Use Accurate When Stopped', range: 'ON／OFF', defaultValue: 'ON', mode: '軽量時', role: '再生中だけ軽量にし、停止すると高精度へ戻します。', note: 'Render Queueは設定に関係なく常に高精度です。' },
    ],
  },
  {
    id: 'camera-capture',
    page: 'camera',
    label: '家庭用カメラ撮像',
    eyebrow: 'CAMERA STAGE',
    description: '家庭用ビデオカメラらしい解像感、色、暗部ノイズ。',
      condition: 'カメラ撮像処理強度が0%では、ほかのカメラ設定は映像に反映されません。',
    parameters: [
      { id: 'camera-strength', label: 'カメラ撮像処理強度', labelEn: 'Camera Capture Strength', range: '0–100%', defaultValue: '0%', mode: '両方', role: '上げるほど、輪郭の硬さ、色にじみ、暗部ノイズなどの家庭用カメラらしさがまとめて強くなります。', scopeLabel: 'カメラ全体', guide: '現代映像を家庭用ビデオカメラ風に寄せるなら45–75%。' },
      { id: 'camera-tvl', label: 'カメラ水平解像度 (TVL)', labelEn: 'Camera Luma Resolution (TVL)', range: '120–500 TVL', defaultValue: '330', mode: '両方', role: '下げるほど横方向の細部と輪郭が甘くなり、古いレンズで撮ったような柔らかい画になります。', guide: '平成の標準的な家庭用機は280–380 TVL。' },
      { id: 'camera-chroma-blur', label: 'カメラ色解像度低下', labelEn: 'Camera Chroma Blur', range: '0–100%', defaultValue: '55%', mode: '両方', role: '上げるほど色の境界がにじみ、輪郭は残ったまま色だけが低解像度に見えます。', guide: '家庭用カメラ感は40–70%。', related: 'カメラ色ずれが色の位置を動かすのに対し、色解像度低下は色の輪郭だけを広げます。' },
      { id: 'camera-chroma-offset', label: 'カメラ色ずれ (px)', labelEn: 'Camera Chroma Offset (px)', range: '-20–20 px', defaultValue: '2 px', mode: '両方', role: '0から離すほど色だけが左右へずれ、輪郭から赤や青がはみ出したように見えます。', guide: '通常は-2–3 px、明確な古さは3–6 px。', related: '色解像度低下が色をぼかすのに対し、色ずれは色全体を左右へ移動します。' },
      { id: 'camera-edge', label: 'カメラ輪郭強調', labelEn: 'Camera Edge Enhancement', range: '0–100%', defaultValue: '45%', mode: '両方', role: '上げるほど輪郭が硬くなり、その周囲に明暗の縁取りが出て家庭用カメラらしい映像になります。', guide: '自然な家庭用機は30–60%。' },
      { id: 'camera-clipping', label: 'カメラ白飛び・黒潰れ', labelEn: 'Camera White/Black Clipping', range: '0–100%', defaultValue: '35%', mode: '両方', role: '上げるほど明るい部分は白く飛び、暗い部分は黒く潰れて、明暗の幅が狭くなります。', guide: '自然な家庭用機は25–55%。' },
      { id: 'ccd-noise', label: 'CCD暗部ノイズ・階調', labelEn: 'CCD Low-Light Noise/Tonality', range: '0–100%', defaultValue: '30%', mode: '両方', role: '上げるほど暗い部分に明るさと色のざらつきが増え、階調も粗くなります。', guide: '室内は30–55%、低照度は55–85%。' },
      { id: 'camera-awb', label: 'カメラAWB色温度揺れ', labelEn: 'Camera AWB Color Drift', range: '0–100%', defaultValue: '25%', mode: '両方', role: '上げるほど画面全体の色が暖色と寒色の間をゆっくり揺れ、自動補正が迷う様子を再現します。', guide: '自然な家庭用機は15–40%。' },
    ],
  },
  {
    id: 'vhs-recording',
    page: 'vhs-signal',
    label: 'VHS記録方式・解像度',
    eyebrow: 'RECORDING',
    description: '録画モードと、映像の横・縦方向の細かさ。',
    condition: 'VHS処理強度が0%では、VHS信号とテープ劣化に関する変化は映像に反映されません。',
    parameters: [
      { id: 'recording-speed', label: '録画速度', labelEn: 'Recording Speed', range: 'SP／LP／EP', defaultValue: 'SP', mode: '両方', role: 'SPからLP、EPへ変えるほど映像が柔らかく、ノイズと走行の揺れが目立つ長時間録画らしい画になります。', scopeLabel: '録画モード', guide: '標準的なVHSはSP、家庭用3倍モードはEP。' },
      { id: 'vhs-strength', label: 'VHS処理強度', labelEn: 'VHS Processing Strength', range: '0–100%', defaultValue: '75%', mode: '両方', role: '上げるほど、ぼけ、色にじみ、ノイズ、走行の揺れなどVHS全体の変化が強く現れます。', scopeLabel: 'VHS全体', guide: '自然な素材は45–75%、明確な劣化は75–100%。' },
      { id: 'pixel-scale', label: '処理ピクセル比率 (%)', labelEn: 'Processing Pixel Scale (%)', range: '25–100%', defaultValue: '100%', mode: '両方', role: '下げるほど処理に使う画素数が減り、映像全体の細部が粗くなります。', guide: '720p相当はFull HDで66.6667%。', related: 'TVLや走査線数より前の処理解像度です。下げると横・縦を問わず画面全体の画素量が減ります。' },
      { id: 'luma-bandwidth', label: '輝度水平帯域 (TVL)', labelEn: 'Luma Bandwidth (TVL)', range: '80–360 TVL', defaultValue: '240', mode: '両方', role: '下げるほど横方向の細部と明暗の輪郭がぼやけ、VHSらしい柔らかい画になります。', guide: '通常VHS SPは200–260 TVL。', related: '処理ピクセル比率は画面全体を粗くし、輝度水平帯域は横方向の明暗情報だけを柔らかくします。' },
      { id: 'vertical-lines', label: '垂直走査線数 (lines)', labelEn: 'Vertical Scan Lines', range: '120–480 lines', defaultValue: '480', mode: '両方', role: '下げるほど上下方向の細部が減り、古いコピー映像のように縦方向が甘く見えます。', guide: '標準は480、古いコピーは240–360。', related: 'TVLが横方向の細部を変えるのに対し、垂直走査線数は上下方向の細部を変えます。CRT走査線の横縞とは別です。' },
    ],
  },
  {
    id: 'vhs-degradation',
    page: 'vhs-signal',
    label: 'VHS色・信号劣化',
    eyebrow: 'SIGNAL DEGRADATION',
    description: '色にじみ、色ずれ、彩度低下、ダビング劣化。',
    parameters: [
      { id: 'vcr-edge', label: 'VCR輝度輪郭補正', labelEn: 'VCR Luma Edge Correction', range: '0–100%', defaultValue: '60%', mode: '両方', role: '上げるほど明暗の境界が硬くなり、輪郭の周囲に白黒の縁取りが出ます。', guide: '40–70%が自然。' },
      { id: 'vhs-chroma-blur', label: 'VHS色帯域ぼけ', labelEn: 'VHS Chroma Bandwidth Blur', range: '0–100%', defaultValue: '55%', mode: '両方', role: '上げるほど色が大きくにじみ、明暗の輪郭よりも色だけがぼやけて見えます。', guide: '標準VHSは45–70%。', related: 'VHS色信号遅れが色の位置を動かすのに対し、色帯域ぼけは色の境界だけを広げます。' },
      { id: 'vhs-chroma-delay', label: 'VHS色信号遅れ (px)', labelEn: 'VHS Chroma Delay (px)', range: '0–50 px', defaultValue: '3 px', mode: '両方', role: '上げるほど色だけが横方向へ遅れ、人物や物の輪郭から色がはみ出します。', guide: '通常1–5 px。', related: '色帯域ぼけが色を広げるのに対し、色信号遅れは色全体を横方向へ移動します。' },
      { id: 'saturation-loss', label: 'VHS彩度低下', labelEn: 'VHS Saturation Loss', range: '0–100%', defaultValue: '15%', mode: '両方', role: '上げるほど色が薄くなり、古いテープやコピー映像のような少し暖かい色合いになります。', guide: '自然な劣化は10–35%。' },
      { id: 'tape-wear', label: 'VHSテープ摩耗', labelEn: 'VHS Tape Wear', range: '0–100%', defaultValue: '20%', mode: '両方', role: '上げるほど解像感、色、明るさが不安定になり、ノイズも増えて使い込んだテープらしくなります。', guide: '保管良好10–25%、レンタル落ち40–70%。', related: 'ダビング世代がコピー回数による劣化を加えるのに対し、テープ摩耗は再生中の不安定さやノイズも増やします。' },
      { id: 'dub-generation', label: 'VHSダビング世代', labelEn: 'VHS Dub Generation', range: '第1–第5世代', defaultValue: '第1世代', mode: '両方', role: '世代を進めるほど、コピーを重ねたように映像がぼやけ、色が薄くなり、ノイズが増えます。', guide: 'テレビ録画のコピーは第2–3世代。', related: 'テープ摩耗は傷みと不安定さ、ダビング世代はコピーを重ねたぼけと色あせが中心です。' },
      { id: 'field-persistence', label: '[高精度] F残像', labelEn: '[Accurate] Field Persistence', range: '0–100%', defaultValue: '18%', mode: '高精度', role: '上げるほど動く物の輪郭に短い残像が残り、古い映像らしい時間方向のにじみが出ます。', guide: '通常10–30%。' },
      { id: 'dot-crawl', label: 'Y/C混信・ドット妨害', labelEn: 'Y/C Crosstalk / Dot Crawl', range: '0–100%', defaultValue: '25%', mode: '両方', role: '上げるほど色の境界に動く点や細かな縞が現れ、コンポジット接続らしいざわつきが出ます。', guide: '自然な接続劣化は15–40%。' },
      { id: 'rf-nonlinearity', label: '[高精度] RF非線形', labelEn: '[Accurate] RF Nonlinearity', range: '0–100%', defaultValue: '20%', mode: '高精度', role: '上げるほど明暗の境界やノイズが不規則に潰れ、信号が限界に近づいたような荒れが出ます。', guide: '自然な範囲は10–35%。', related: 'RFノイズ量は粒状のざらつき、RF非線形は強い明暗やノイズが潰れる荒れを調整します。' },
      { id: 'vcr-agc', label: '[高精度] VCR明度揺れ', labelEn: '[Accurate] VCR AGC Luma Pump', range: '0–100%', defaultValue: '12%', mode: '高精度', role: '上げるほど画面の明るさと色の濃さがゆっくり脈打ち、再生機の自動補正が迷う様子を再現します。', guide: '通常5–20%。' },
    ],
  },
  {
    id: 'tape-failure',
    page: 'tape',
    label: 'VHSテープ・走行故障',
    eyebrow: 'TAPE / TRANSPORT',
    description: '走行揺れ、テープ損傷、同期外れ、画面下端のノイズ。',
      condition: 'VHS処理強度が0%では、ノイズ、損傷、走行故障は映像に反映されません。',
    parameters: [
      { id: 'scan-jitter', label: 'VHS水平走査ゆれ', labelEn: 'VHS Horizontal Scan Jitter', range: '0–100%', defaultValue: '25%', mode: '両方', role: '上げるほど細い横線ごとに映像が左右へ揺れ、輪郭が横方向にちらつきます。', guide: '通常15–35%、不調デッキ40–70%。' },
      { id: 'rf-noise', label: 'VHS RFノイズ量', labelEn: 'VHS RF Noise Amount', range: '0–100%', defaultValue: '20%', mode: '両方', role: '上げるほど白黒のざらつきと色ノイズが増え、テープ信号が弱ったように映像が荒れます。', guide: '良好なSPは8–20%。', related: 'RF非線形が境界や信号を不規則に潰すのに対し、RFノイズ量は画面全体のざらつきを増やします。' },
      { id: 'dropout', label: 'テープ欠損発生量', labelEn: 'Tape Dropout Occurrence', range: '0–100%', defaultValue: '10%', mode: '両方', role: '上げるほど短い横筋や映像の欠けが頻繁に現れ、傷んだテープらしくなります。', guide: '通常3–15%、傷んだテープ20–50%。' },
      { id: 'tracking-failure', label: '[高精度] トラック破綻', labelEn: '[Accurate] Tracking Failure', range: '0–100%', defaultValue: '8%', mode: '高精度', role: '上げるほど太い横帯の中で映像がずれたり崩れたりし、トラッキング不良が強くなります。', guide: '通常0–12%。', related: '下端切替え歪みは画面下部だけ、トラック破綻は太い横帯の内部を崩します。同期外れほど画面全体は動きません。' },
      { id: 'head-clogging', label: '[高精度] ヘッド詰まり', labelEn: '[Accurate] Head Clogging', range: '0–100%', defaultValue: '3%', mode: '高精度', role: '上げるほど一時的に映像が抜ける太いノイズ帯が増え、再生ヘッドの接触不良らしくなります。', guide: '普段は0–5%。' },
      { id: 'sync-loss', label: '[高精度] 同期外れ量', labelEn: '[Accurate] Sync Loss', range: '0–100%', defaultValue: '0%', mode: '高精度', role: '上げるほど画面全体の横ずれ、縦方向の回転、色相の崩れが起こり、映像が大きく破綻します。', guide: '通常のVHS質感では0%を推奨。', related: 'トラック破綻は一部の横帯、同期外れは画面全体の位置や色を崩します。' },
      { id: 'bottom-distortion', label: '下端切替え歪み', labelEn: 'Bottom Switching Distortion', range: '0–200%', defaultValue: '70%', mode: '両方', role: '上げるほど画面下端が横へ強く引き伸ばされ、VHS特有の下端のぐにゃつきが目立ちます。', guide: '自然なVHSは30–90%。', related: 'トラック破綻が太い横帯を作るのに対し、下端切替え歪みは画面下部だけを横へ引き伸ばします。' },
      { id: 'bottom-height', label: '下端ノイズ帯高さ', labelEn: 'Bottom Noise Band Height', range: '0–20%', defaultValue: '4%', mode: '両方', role: '上げるほど画面下端の崩れた帯が上方向へ広がり、占める面積が大きくなります。', guide: '通常2–5%。', note: '下端切替え歪みまたは下端ノイズ帯強度が0%より大きいときに調整できます。' },
      { id: 'bottom-strength', label: '下端ノイズ帯強度', labelEn: 'Bottom Noise Band Strength', range: '0–200%', defaultValue: '80%', mode: '両方', role: '上げるほど下端帯のざらつきと明暗差が強くなり、帯がはっきり見えるようになります。', guide: '自然な帯は40–100%。' },
      { id: 'bottom-grain', label: '下端粒径 (100=標準)', labelEn: 'Bottom Grain (100=Normal)', range: '50–400%', defaultValue: '100%', mode: '両方', role: '上げるほど下端帯のノイズ粒が大きくなり、下げるほど細かな粒になります。', guide: '実写らしさは70–160%。', note: '下端ノイズ帯強度が0%より大きいときに調整できます。' },
      { id: 'bottom-chroma', label: '下端ノイズ色ずれ', labelEn: 'Bottom Noise Chroma Shift', range: '0–200%', defaultValue: '100%', mode: '両方', role: '上げるほど下端帯の色が大きくずれ、赤や青の筋とちらつきが強くなります。', guide: '通常60–120%。', note: '下端切替え歪みまたは下端ノイズ帯強度が0%より大きいときに調整できます。' },
      { id: 'noise-pattern', label: 'ノイズパターン番号', labelEn: 'Noise Pattern Number', range: '1–9999', defaultValue: '1978', mode: '両方', role: '番号を変えると、強さはそのままでノイズや傷が現れる位置と形だけが変わります。', guide: '同じシリーズでは固定を推奨。' },
    ],
  },
  {
    id: 'crt-output',
    page: 'crt',
    label: 'CRT表示と最終出力',
    eyebrow: 'DISPLAY / OUTPUT',
    description: 'ブラウン管テレビらしい走査線、発光、画面の丸み。',
    condition: 'CRT処理強度が0%では、走査線、発光、黒枠、画面の丸みは映像に反映されません。',
    parameters: [
      { id: 'crt-strength', label: 'CRT処理強度', labelEn: 'CRT Processing Strength', range: '0–100%', defaultValue: '35%', mode: '両方', role: '上げるほど走査線、明部の発光、色の格子、画面の丸みがまとめて強くなります。', scopeLabel: 'CRT全体', guide: '控えめなCRTは20–45%。', related: '管面黒枠だけを消す場合はCRT管面黒枠を0%にします。CRT処理強度を0%にするとCRT効果全体が無効になります。' },
      { id: 'crt-frame', label: 'CRT管面黒枠', labelEn: 'CRT Tube Black Frame', range: '0–100%', defaultValue: '0%', mode: '両方', role: '上げるほど画面の外側に黒い縁が広がり、ブラウン管の管面を映したように見えます。', guide: 'フル画面素材は0%、テレビ筐体感は60–100%。', related: 'CRT処理強度は走査線や発光を含む全体量、管面黒枠は外側の黒い縁だけを調整します。' },
      { id: 'crt-scanlines', label: 'CRT走査線', labelEn: 'CRT Scanlines', range: '0–100%', defaultValue: '35%', mode: '両方', role: '上げるほど横方向の暗い線がはっきり現れ、ブラウン管の電子ビームらしい縞が強くなります。', guide: '1080pでは25–50%。' },
      { id: 'crt-bloom', label: 'CRT蛍光体ブルーム', labelEn: 'CRT Phosphor Bloom', range: '0–100%', defaultValue: '30%', mode: '両方', role: '上げるほど明るい部分の光が周囲へ柔らかく広がり、にじんで発光しているように見えます。', guide: '自然な表示は20–45%。' },
      { id: 'crt-mask', label: 'CRTシャドウマスク', labelEn: 'CRT Shadow Mask', range: '0–100%', defaultValue: '25%', mode: '両方', role: '上げるほど赤・緑・青の細かな格子が見え、ブラウン管を近くで見たような質感になります。', guide: 'フルHD以上の最終出力で15–35%。', related: 'CRT走査線が横方向の暗い縞を作るのに対し、シャドウマスクは赤・緑・青の細かな格子を重ねます。', note: '低解像度では偽格子防止のため自動的に弱くなります。' },
      { id: 'crt-curvature', label: 'CRT画面曲率', labelEn: 'CRT Screen Curvature', range: '0–100%', defaultValue: '18%', mode: '両方', role: '上げるほど画面中央がふくらみ、四隅が奥へ曲がるブラウン管らしい丸みが強くなります。', guide: '自然な民生CRTは10–30%。' },
      { id: 'final-mix', label: '最終合成量', labelEn: 'Final Effect Mix', range: '0–100%', defaultValue: '100%', mode: '両方', role: '0%では元映像、100%では処理後の映像になり、その間で効果全体の濃さを調整できます。', scopeLabel: '出力全体', guide: '薄く重ねる用途は50–85%。' },
    ],
  },
]

export const vhsGlossaryGroups: VhsGlossaryGroup[] = [
  {
    label: 'CRT表示',
    terms: [
      {
        id: 'term-crt',
        term: 'CRT（ブラウン管）',
        termEn: 'Cathode-Ray Tube',
        description: '液晶以前に広く使われたテレビやモニターです。電子ビームで画面を走査して発光させるため、横縞、明部のにじみ、色の細かな格子、丸い画面形状が見た目の特徴になります。',
        keywords: 'crt ブラウン管 テレビ モニター 電子ビーム cathode ray tube',
      },
      {
        id: 'term-scanlines',
        term: '走査線',
        termEn: 'Scanlines',
        description: '映像を横線の積み重ねとして描くときの一本です。「垂直走査線数」は上下方向の細部量、「CRT走査線」はブラウン管の横縞を調整するため、名前は似ていますが別の項目です。',
        keywords: '走査線 scanline lines 横線 縞 垂直走査線 crt走査線',
      },
      {
        id: 'term-bloom',
        term: 'ブルーム',
        termEn: 'Bloom',
        description: '明るい部分の光が周囲へ広がって見える現象です。CRT蛍光体ブルームを上げると、白文字や照明が柔らかくにじんで発光します。',
        keywords: 'ブルーム bloom 発光 光 にじみ 蛍光体',
      },
      {
        id: 'term-shadow-mask',
        term: 'シャドウマスク',
        termEn: 'Shadow Mask',
    description: 'ブラウン管の赤・緑・青を正しい位置へ当てるための細かな金属マスクです。CRTシャドウマスクでは、画面を近くで見たときのRGB格子を再現します。',
        keywords: 'シャドウマスク shadow mask rgb 格子 ドット 蛍光体',
      },
      {
        id: 'term-curvature',
        term: '画面曲率',
        termEn: 'Screen Curvature',
        description: '古いブラウン管の表面が平面ではなく、外側へふくらんでいる形状です。値を上げると中央のふくらみと四隅の曲がりが強くなります。',
        keywords: '曲率 curvature 丸み ブラウン管 四隅 歪み',
      },
    ],
  },
  {
    label: 'カメラと解像度',
    terms: [
      {
        id: 'term-tvl',
        term: 'TVL',
        termEn: 'Television Lines',
        description: 'アナログ映像が横方向の細部をどこまで見分けられるかを表す目安です。ピクセル数とは別物で、値を下げるほど輪郭や細部が横方向にぼやけます。',
        keywords: 'tvl television lines 解像度 水平 帯域 ピクセル ぼけ',
      },
      {
        id: 'term-ccd',
        term: 'CCD',
        termEn: 'Charge-Coupled Device',
    description: '家庭用ビデオカメラなどで使われてきた撮像素子です。CCD暗部ノイズ・階調では、暗部に明るさと色のざらつきを加えます。',
        keywords: 'ccd 撮像素子 センサー 暗部 ノイズ 低照度',
      },
      {
        id: 'term-awb',
        term: 'AWB',
        termEn: 'Auto White Balance',
        description: '白い物が白く見えるように、カメラが色合いを自動補正する機能です。補正が遅れたり迷ったりすると、映像全体が暖色と寒色の間を揺れます。',
        keywords: 'awb auto white balance オート ホワイトバランス 色温度 暖色 寒色',
      },
      {
        id: 'term-luma-chroma',
        term: '輝度と色差',
        termEn: 'Luma / Chroma',
        description: '輝度は明るさと輪郭、色差は色の情報です。VHSでは色の情報が明るさより粗く記録されるため、輪郭は見えても色だけが大きくにじむことがあります。',
        keywords: '輝度 色差 luma chroma y c 明るさ 色 にじみ',
      },
    ],
  },
  {
    label: 'VHS信号と再生',
    terms: [
      {
        id: 'term-ntsc-j',
        term: 'NTSC-J',
        termEn: 'NTSC Japan',
    description: '日本で使われていたアナログテレビ方式です。対応方式はNTSC-J VHSで、PALやSECAMには対応しません。',
        keywords: 'ntsc ntsc-j japan 日本 アナログ テレビ pal secam',
      },
      {
        id: 'term-recording-speed',
        term: 'SP・LP・EP',
        termEn: 'Recording Speed',
        description: 'VHSの録画速度です。SPは標準、LPとEPは長時間録画向けで、長時間側ほど映像が柔らかくなり、ノイズや走行の揺れが目立ちます。',
        keywords: 'sp lp ep 録画速度 標準 長時間 3倍モード',
      },
      {
        id: 'term-yc',
        term: 'Y/C',
        termEn: 'Luma / Chroma',
    description: 'Yは明るさ、Cは色の信号です。YとCが十分に分かれないと、色の境界に動く点や縞が出るドット妨害や、色にじみが発生します。',
        keywords: 'y/c yc y c 輝度 色差 ドット妨害 ドットクロール 混信',
      },
      {
        id: 'term-rf',
        term: 'RF',
        termEn: 'Radio Frequency',
        description: 'テープへ記録され、再生ヘッドが読み取る高周波の信号です。RFノイズやRF非線形は、テープへ記録された信号の荒れや欠けを再現する項目です。',
        keywords: 'rf radio frequency 高周波 テープ信号 ヘッド ノイズ 非線形',
      },
      {
        id: 'term-agc',
        term: 'AGC',
        termEn: 'Automatic Gain Control',
        description: '映像の明るさや信号レベルを自動的に整える機能です。追従が遅いと、画面の明るさや色の濃さがゆっくり脈打つように変化します。',
        keywords: 'agc automatic gain control 自動 明度 彩度 揺れ ポンピング',
      },
      {
        id: 'term-dropout',
        term: 'ドロップアウト',
        termEn: 'Tape Dropout',
        description: 'テープ表面の傷や磁性層の欠けで、記録信号の一部を読み取れなくなる現象です。映像では短い横筋や部分的な欠けとして現れます。',
        keywords: 'ドロップアウト dropout テープ 傷 磁性層 横筋 欠け',
      },
      {
        id: 'term-tracking',
        term: 'トラッキング',
        termEn: 'Tracking',
        description: '再生ヘッドをテープ上の記録位置へ合わせることです。位置がずれると、太い横帯の中で映像がずれたり、強いノイズが出たりします。',
        keywords: 'トラッキング tracking ヘッド 記録位置 横帯 ずれ ノイズ',
      },
      {
        id: 'term-sync',
        term: '同期・同期外れ',
        termEn: 'Video Sync / Sync Loss',
        description: '画面を横・縦方向の正しい位置へ表示するためのタイミング情報です。同期が外れると、画面の横ずれ、縦方向の回転、色相の崩れが起こります。',
        keywords: '同期 同期外れ sync loss 水平 垂直 縦ロール 色相',
      },
    ],
  },
]

export const vhsPresetSummaries: VhsPresetSummary[] = [
  {
    id: 'good-home-sp',
    name: '良好な家庭用SP',
    appearance: '輪郭と色を少しだけ甘くした、保存状態のよい標準録画。',
    use: '運動会、旅行、誕生日などのホームビデオ。MVやドラマへVHSらしさだけを薄く足したい場合にも向いています。',
  },
  {
    id: 'long-play-ep',
    name: '長時間EP',
    appearance: '解像感を落とし、色にじみと暗部ノイズを強めた長時間録画。',
    use: '深夜番組の留守録、映画やスポーツ中継など、1本のテープへ長時間録画した映像に向いています。',
  },
  {
    id: 'multi-generation-dub',
    name: '多重ダビング',
    appearance: 'コピーを重ねたようなぼけ、色あせ、ノイズを加えます。',
    use: '孫コピーのライブ映像、出所不明の流出映像、古い資料映像の挿入カットに向いています。',
  },
  {
    id: 'worn-rental-crt',
    name: 'レンタル落ちCRT',
    appearance: '傷んだテープの欠けや走行の乱れを、ブラウン管表示と組み合わせます。',
    use: 'レンタルビデオをリビングのテレビで観る場面、古い映画やホラー作品のテレビ画面に向いています。',
  },
  {
    id: 'tracking-failure',
    name: 'トラッキング故障',
    appearance: '太い横帯、横ずれ、画面下端の乱れを目立たせます。',
    use: '再生開始直後の乱れ、古い監視録画の途切れ、ホラーや事故映像の瞬間的な崩れに向いています。',
  },
  {
    id: 'old-camcorder',
    name: '古いビデオカメラ',
    appearance: '硬い輪郭、暗部のざらつき、揺れる色味を加えます。',
    use: '結婚式、旅行、学校行事、夜の路上撮影など、家庭用ビデオカメラで撮った視点の映像に向いています。',
  },
]

export const vhsIssues: VhsIssue[] = [
  { id: 'not-listed', question: 'エフェクト一覧に出ない', answer: 'After EffectsとDynamic Linkを使うAdobeアプリを終了し、配布フォルダー全体の配置とWindows x64版であることを確認します。旧版との二重配置も避けてください。', keywords: 'エフェクト 出ない 一覧 インストール aex' },
  { id: 'camera-hidden', question: 'カメラ設定を変えても映像が変わらない', answer: 'カメラ撮像処理強度が0%では、ほかのカメラ設定は反映されません。撮像強度を上げてから各項目を調整します。', keywords: 'カメラ 撮像 変化しない 反映されない 強度 0' },
  { id: 'ccd-hidden', question: 'CCD暗部ノイズが見えない', answer: 'CCD暗部ノイズは明るい部分では自動的に弱まります。暗い部分をフル解像度・100%表示で確認します。', keywords: 'ccd 暗部 ノイズ 見えない 明部 原寸' },
  { id: 'temporal-hidden', question: 'ノイズや揺れが静止画で見えない', answer: '時間で変化する項目は、1フレームだけでは変化が現れないことがあります。数秒間プレビュー再生して確認します。', keywords: '時間 変化 ノイズ 揺れ 静止 1フレーム 再生' },
  { id: 'accurate-hidden', question: '高精度の項目が反映されない', answer: '高精度と付いた項目は軽量では表示されません。プレビュー品質を高精度へ切り替えて確認します。', keywords: '高精度 軽量 反映されない 表示されない accurate' },
  { id: 'pixel-scale-hidden', question: '処理ピクセル比率を変えても見た目が変わらない', answer: '100%では元の処理解像度と同じため、変化は出ません。50–70%へ下げ、フル解像度・100%表示で比較します。', keywords: '処理ピクセル比率 100 変化しない 50 70 解像度' },
  { id: 'gpu-fallback', question: 'GPUで動かない', answer: '配布フォルダー内のファイルを個別に移動・削除していないこと、AEのプロジェクト設定とGPUドライバーを確認します。GPUを利用できない環境ではCPU処理へ自動的に切り替わります。', keywords: 'gpu cuda directx cpu fallback' },
  { id: 'ui-language', question: '日本語が文字化けする／英語になる', answer: '表示の問題でレンダー結果には影響しません。After Effectsを再起動し、続く場合は配布フォルダーを入れ直してください。日本語表示に問題がある場合は英語表示へ切り替わります。', keywords: '日本語 英語 文字化け ui language' },
  { id: 'preview-state', question: '再生中も高精度のまま／停止後も軽量のまま', answer: 'プレビュー品質を軽量にし、「停止時は高精度」を確認してください。スクラブではなく実際のプレビュー再生で判定します。Render Queueが高精度になるのは仕様です。', keywords: '軽量 高精度 停止 再生 preview render queue' },
  { id: 'pixel-vs-tvl', question: '処理ピクセル比率とTVLの違いが分からない', answer: '処理ピクセル比率は実際の作業画素数、TVLは水平方向のアナログ輝度帯域、垂直走査線数は上下方向の細部量です。1項目ずつ変えて比較してください。', keywords: 'pixel tvl lines 違い 解像度' },
  { id: 'crt-frame-zero', question: 'CRT管面黒枠を0にすると期待と違う', answer: '管面黒枠は黒い外縁だけを消します。CRT全体を無効にする場合は、CRT処理強度を0%にします。', keywords: 'crt 黒枠 0 無効' },
  { id: 'mask-hidden', question: 'CRTの細かな模様が見えない', answer: 'Half／Quarter表示を避け、フル解像度・100%表示で確認します。シャドウマスクは、表示解像度が低い場合に偽格子を防ぐため自動的に弱くなります。', keywords: 'crt shadow mask シャドウマスク 走査線 模様 見えない 解像度' },
  { id: 'bottom-weak', question: '下端ノイズが弱い', answer: '下端ノイズ帯高さ、切替え歪み、帯強度で帯の見え方を決めます。粒径は強度ではなくサイズだけを変更します。色を崩す場合は色ずれも上げます。', keywords: '下端 ノイズ 弱い 粒径 色ずれ' },
  { id: 'too-broken', question: '映像全体が壊れすぎる', answer: '同期外れとトラッキングを下げ、テープ摩耗とダビング世代の重複を確認します。最後にVHS処理強度または最終合成量で全体量を整えます。', keywords: '壊れすぎ 同期 トラッキング 強い' },
]

export const allVhsNavItems = vhsNavGroups.flatMap((group) => group.items)
export const allVhsParameters = vhsParameterGroups.flatMap((group) => group.parameters)
export const allVhsGlossaryTerms = vhsGlossaryGroups.flatMap((group) => group.terms)
