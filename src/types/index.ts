export interface ApiKeys {
  visionApiKey: string
  claudeApiKey: string
}

export interface RecognizedKanji {
  character: string
  reading: string
}

export interface KanjiMeaning {
  character: string
  reading: string
  meaning: string
}

export type Screen = 'home' | 'camera' | 'result' | 'settings'
