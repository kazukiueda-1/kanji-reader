import type { RecognizedKanji } from '../types'

interface VisionApiResponse {
  responses: Array<{
    textAnnotations?: Array<{
      description: string
    }>
    error?: { message: string }
  }>
}

// 漢字かどうか判定（CJK統合漢字のUnicode範囲）
function isKanji(char: string): boolean {
  const code = char.charCodeAt(0)
  return (
    (code >= 0x4e00 && code <= 0x9faf) || // CJK Unified Ideographs
    (code >= 0x3400 && code <= 0x4dbf) || // CJK Unified Ideographs Extension A
    (code >= 0xf900 && code <= 0xfaff)    // CJK Compatibility Ideographs
  )
}

// 簡易的な漢字→読みの対応表（よく使う漢字）
const commonReadings: Record<string, string> = {
  '山': 'やま', '川': 'かわ', '田': 'た', '森': 'もり', '林': 'はやし',
  '木': 'き', '花': 'はな', '草': 'くさ', '空': 'そら', '海': 'うみ',
  '水': 'みず', '火': 'ひ', '土': 'つち', '石': 'いし', '金': 'かね',
  '日': 'ひ', '月': 'つき', '星': 'ほし', '雨': 'あめ', '雪': 'ゆき',
  '風': 'かぜ', '雲': 'くも', '虹': 'にじ', '光': 'ひかり', '影': 'かげ',
  '人': 'ひと', '子': 'こ', '女': 'おんな', '男': 'おとこ', '父': 'ちち',
  '母': 'はは', '兄': 'あに', '姉': 'あね', '弟': 'おとうと', '妹': 'いもうと',
  '犬': 'いぬ', '猫': 'ねこ', '鳥': 'とり', '魚': 'さかな', '虫': 'むし',
  '馬': 'うま', '牛': 'うし', '羊': 'ひつじ', '豚': 'ぶた', '鹿': 'しか',
  '目': 'め', '耳': 'みみ', '口': 'くち', '手': 'て', '足': 'あし',
  '頭': 'あたま', '顔': 'かお', '心': 'こころ', '体': 'からだ', '力': 'ちから',
  '大': 'おお', '小': 'しょう', '中': 'なか', '上': 'うえ', '下': 'した',
  '右': 'みぎ', '左': 'ひだり', '前': 'まえ', '後': 'うしろ', '内': 'うち',
  '外': 'そと', '北': 'きた', '南': 'みなみ', '東': 'ひがし', '西': 'にし',
  '赤': 'あか', '青': 'あお', '白': 'しろ', '黒': 'くろ', '黄': 'き',
  '一': 'いち', '二': 'に', '三': 'さん', '四': 'し', '五': 'ご',
  '六': 'ろく', '七': 'しち', '八': 'はち', '九': 'きゅう', '十': 'じゅう',
  '百': 'ひゃく', '千': 'せん', '万': 'まん', '円': 'えん', '年': 'ねん',
  '学': 'がく', '校': 'こう', '先': 'せん', '生': 'せい', '友': 'とも',
  '名': 'な', '本': 'ほん', '文': 'ぶん', '字': 'じ', '語': 'ご',
  '食': 'た', '飲': 'の', '見': 'み', '聞': 'き', '読': 'よ',
  '書': 'か', '話': 'はなし', '言': 'い', '行': 'い', '来': 'く',
  '出': 'で', '入': 'い', '立': 'た', '休': 'やす', '走': 'はし',
  '歩': 'ある', '飛': 'と', '泳': 'およ', '遊': 'あそ', '笑': 'わら',
  '泣': 'な', '怒': 'おこ', '喜': 'よろこ', '悲': 'かな', '楽': 'たの',
  '天': 'てん', '地': 'ち', '国': 'くに', '町': 'まち', '村': 'むら',
  '道': 'みち', '橋': 'はし', '駅': 'えき', '店': 'みせ', '家': 'いえ',
  '門': 'もん', '窓': 'まど', '庭': 'にわ', '部': 'ぶ', '屋': 'や',
  '春': 'はる', '夏': 'なつ', '秋': 'あき', '冬': 'ふゆ', '朝': 'あさ',
  '昼': 'ひる', '夜': 'よる', '夕': 'ゆう', '午': 'ご', '時': 'じ',
  '今': 'いま', '新': 'あたら', '古': 'ふる', '長': 'なが', '短': 'みじか',
  '高': 'たか', '低': 'ひく', '広': 'ひろ', '狭': 'せま', '強': 'つよ',
  '弱': 'よわ', '早': 'はや', '遅': 'おそ', '近': 'ちか', '遠': 'とお',
  '多': 'おお', '少': 'すく', '重': 'おも', '軽': 'かる', '明': 'あか',
  '暗': 'くら', '正': 'ただ', '間': 'あいだ', '気': 'き', '電': 'でん',
  '車': 'くるま', '船': 'ふね', '色': 'いろ', '音': 'おと', '声': 'こえ',
}

export async function recognizeText(
  imageBase64: string,
  apiKey: string
): Promise<RecognizedKanji[]> {
  // base64からdata:image/...;base64,プレフィックスを除去
  const base64Content = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64Content },
            features: [{ type: 'TEXT_DETECTION', maxResults: 10 }],
          },
        ],
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Vision API エラー: ${response.status}`)
  }

  const data: VisionApiResponse = await response.json()

  if (data.responses[0]?.error) {
    throw new Error(data.responses[0].error.message)
  }

  const fullText = data.responses[0]?.textAnnotations?.[0]?.description ?? ''

  // テキストから漢字を抽出（重複排除）
  const kanjiSet = new Set<string>()
  for (const char of fullText) {
    if (isKanji(char)) {
      kanjiSet.add(char)
    }
  }

  return Array.from(kanjiSet).map((char) => ({
    character: char,
    reading: commonReadings[char] ?? '？',
  }))
}
