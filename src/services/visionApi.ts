interface VisionApiResponse {
  responses: Array<{
    textAnnotations?: Array<{
      description: string
    }>
    error?: { message: string }
  }>
}

export async function recognizeText(
  imageBase64: string,
  apiKey: string
): Promise<string> {
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

  return data.responses[0]?.textAnnotations?.[0]?.description ?? ''
}
