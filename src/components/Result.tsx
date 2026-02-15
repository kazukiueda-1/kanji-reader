import { useState, useEffect } from 'react'
import type { RecognizedKanji } from '../types'
import { loadApiKeys } from '../services/storage'
import { recognizeText } from '../services/visionApi'
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
        const result = await recognizeText(image, keys.visionApiKey)
        setKanjiList(result)
        if (result.length === 0) {
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
          <p>よみとりちゅう...</p>
          <div className={styles.spinner} />
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {kanjiList.length > 0 && (
        <div className={styles.kanjiList}>
          <p className={styles.instruction}>かんじをタップしてね！</p>
          {kanjiList.map((k) => (
            <button
              key={k.character}
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
