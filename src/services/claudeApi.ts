interface ClaudeResponse {
  content: Array<{ type: string; text: string }>
}

export async function getKanjiMeaning(
  kanji: string,
  reading: string,
  apiKey: string
): Promise<string> {
  const prompt = `漢字「${kanji}」（よみ：${reading}）の意味を6さいの子どもにもわかるように、やさしいひらがなだけで2〜3ぶんで説明してください。むずかしいことばは使わないでください。`

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
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Claude API エラー: ${response.status} - ${errorText}`)
  }

  const data: ClaudeResponse = await response.json()
  return data.content[0]?.text ?? 'いみがわかりませんでした'
}
