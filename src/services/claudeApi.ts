import type { RecognizedKanji } from '../types'

interface ClaudeResponse {
  content: Array<{ type: string; text: string }>
}

async function callClaude(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Claude API エラー: ${response.status} - ${errorText}`)
  }

  const data: ClaudeResponse = await response.json()
  return data.content[0]?.text ?? ''
}

export async function extractKanjiWords(
  ocrText: string,
  apiKey: string
): Promise<RecognizedKanji[]> {
  const prompt = `以下のOCRテキストから、漢字を含む単語を抽出し、それぞれのよみがな（ひらがな）をつけてください。
単語としてまとまりのあるものはまとめてください（例：「暖房」は「だんぼう」、「自動」は「じどう」）。
1文字だけの漢字も含めてください。

必ず以下のJSON配列形式だけで回答してください。説明文は不要です：
[{"character":"暖房","reading":"だんぼう"},{"character":"自動","reading":"じどう"}]

OCRテキスト：
${ocrText}`

  const result = await callClaude(prompt, apiKey)

  // JSONを抽出（前後に余計なテキストがある場合に対応）
  const jsonMatch = result.match(/\[[\s\S]*\]/)
  if (!jsonMatch) return []

  try {
    return JSON.parse(jsonMatch[0]) as RecognizedKanji[]
  } catch {
    return []
  }
}

export async function getKanjiMeaning(
  kanji: string,
  reading: string,
  apiKey: string
): Promise<string> {
  const prompt = `「${kanji}」（よみ：${reading}）の意味を6さいの子どもにもわかるように、やさしいひらがなだけで2〜3ぶんで説明してください。むずかしいことばは使わないでください。`
  return callClaude(prompt, apiKey)
}
