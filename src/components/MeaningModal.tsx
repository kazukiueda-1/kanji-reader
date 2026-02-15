import { useState, useEffect } from 'react'
import type { RecognizedKanji } from '../types'
import { loadApiKeys } from '../services/storage'
import { getKanjiMeaning } from '../services/claudeApi'
import styles from './MeaningModal.module.css'

interface MeaningModalProps {
  kanji: RecognizedKanji
  onClose: () => void
}

function MeaningModal({ kanji, onClose }: MeaningModalProps) {
  const [meaning, setMeaning] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMeaning() {
      const keys = loadApiKeys()
      if (!keys) {
        setError('APIキーがせっていされていません')
        setLoading(false)
        return
      }

      try {
        const result = await getKanjiMeaning(
          kanji.character,
          kanji.reading,
          keys.claudeApiKey
        )
        setMeaning(result)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'エラーがおきました')
      } finally {
        setLoading(false)
      }
    }

    fetchMeaning()
  }, [kanji])

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.kanjiDisplay}>
          <span className={styles.kanjiChar}>{kanji.character}</span>
          <span className={styles.kanjiReading}>{kanji.reading}</span>
        </div>

        <div className={styles.meaningSection}>
          {loading && (
            <div className={styles.loading}>
              <p>しらべているよ...</p>
              <div className={styles.spinner} />
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}

          {meaning && <p className={styles.meaning}>{meaning}</p>}
        </div>

        <button className={styles.closeBtn} onClick={onClose}>
          とじる
        </button>
      </div>
    </div>
  )
}

export default MeaningModal
