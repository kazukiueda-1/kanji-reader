import type { ApiKeys } from '../types'

const STORAGE_KEY = 'kanji-reader-api-keys'

export function saveApiKeys(keys: ApiKeys): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
}

export function loadApiKeys(): ApiKeys | null {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null
  try {
    const keys = JSON.parse(stored) as ApiKeys
    if (keys.visionApiKey && keys.claudeApiKey) return keys
    return null
  } catch {
    return null
  }
}

export function hasApiKeys(): boolean {
  return loadApiKeys() !== null
}
