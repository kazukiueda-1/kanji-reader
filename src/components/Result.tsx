import { useState, useEffect } from 'react'
import type { RecognizedKanji } from '../types'
import { loadApiKeys } from '../services/storage'
import { recognizeText } from '../services/visionApi'
import { extractKanjiWords } from '../services/claudeApi'
import MeaningModal from './MeaningModal'
import styles from './Result.module.css'

interface ResultProps {
  image: string
  kanjiList: RecognizedKanji[]
  setKanjiList: (list: RecognizedKanji[]) => void
  onBack: () => void
}

function Result({ image, kanjiList, setKanjiList, onBack }: ResultProps) {
  const [loading, setLoading] = useState(true)
  const [statusText, setStatusText] = useState('よみとりちゅう...')
  const [error, setError] = useState<string | null>(null)
  const [selectedKanji, setSelectedKanji] = useState<RecognizedKanji | null>(null)

  useEffect(() => {
    if (kanjiList.length > 0) {
      setLoading(false)
      return
    }

    async function recognize() {
      const keys = loadApiKeys()
      if (!keys) {
        setError('APIキーがせっていされていません')
        setLoading(false)
        return
      }

      try {
        // Step 1: Vision APIでOCR
        setStatusText('もじをよみとっているよ...')
        const ocrText = await recognizeText(image, keys.visionApiKey)

        if (!ocrText.trim()) {
          setError('もじがみつかりませんでした')
          setLoading(false)
          return
        }

        // Step 2: Claude APIで漢字単語を抽出＋読み付与
        setStatusText('かんじをしらべているよ...')
        const words = await extractKanjiWords(ocrText, keys.claudeApiKey)

        setKanjiList(words)
        if (words.length === 0) {
          setError('かんじがみつかりませんでした')
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'エラーがおきました')
      } finally {
        setLoading(false)
      }
    }

    recognize()
  }, [image, kanjiList.length, setKanjiList])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          ← もどる
        </button>
        <h2 className={styles.title}>けっか</h2>
      </div>

      <img src={image} alt="さつえいした しゃしん" className={styles.image} />

      {loading && (
        <div className={styles.loading}>
          <p>{statusText}</p>
          <div className={styles.spinner} />
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {kanjiList.length > 0 && (
        <div className={styles.kanjiList}>
          <p className={styles.instruction}>かんじをタップしてね！</p>
          {kanjiList.map((k, i) => (
            <button
              key={`${k.character}-${i}`}
              className={styles.kanjiItem}
              onClick={() => setSelectedKanji(k)}
            >
              <span className={styles.kanjiChar}>{k.character}</span>
              <span className={styles.kanjiReading}>{k.reading}</span>
            </button>
          ))}
        </div>
      )}

      {selectedKanji && (
        <MeaningModal
          kanji={selectedKanji}
          onClose={() => setSelectedKanji(null)}
        />
      )}
    </div>
  )
}

export default Result
