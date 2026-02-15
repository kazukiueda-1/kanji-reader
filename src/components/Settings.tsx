import { useState } from 'react'
import { loadApiKeys, saveApiKeys } from '../services/storage'
import styles from './Settings.module.css'

interface SettingsProps {
  onSave: () => void
  onBack?: () => void
}

function Settings({ onSave, onBack }: SettingsProps) {
  const existing = loadApiKeys()
  const [visionKey, setVisionKey] = useState(existing?.visionApiKey ?? '')
  const [claudeKey, setClaudeKey] = useState(existing?.claudeApiKey ?? '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (!visionKey.trim() || !claudeKey.trim()) return
    saveApiKeys({
      visionApiKey: visionKey.trim(),
      claudeApiKey: claudeKey.trim(),
    })
    setSaved(true)
    setTimeout(() => onSave(), 800)
  }

  const canSave = visionKey.trim().length > 0 && claudeKey.trim().length > 0

  return (
    <div className={styles.container}>
      {onBack && (
        <button className={styles.backBtn} onClick={onBack}>
          ← もどる
        </button>
      )}

      <h1 className={styles.title}>せってい</h1>
      <p className={styles.subtitle}>ほごしゃのかたへ：APIキーをにゅうりょくしてください</p>

      <div className={styles.form}>
        <label className={styles.label}>
          Google Cloud Vision API キー
          <input
            type="password"
            className={styles.input}
            value={visionKey}
            onChange={(e) => setVisionKey(e.target.value)}
            placeholder="AIza..."
          />
        </label>

        <label className={styles.label}>
          Claude API キー（Anthropic）
          <input
            type="password"
            className={styles.input}
            value={claudeKey}
            onChange={(e) => setClaudeKey(e.target.value)}
            placeholder="sk-ant-..."
          />
        </label>

        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={!canSave}
        >
          {saved ? 'ほぞんしました！' : 'ほぞん'}
        </button>
      </div>

      <div className={styles.info}>
        <p>※ APIキーはこのたんまつのブラウザにだけほぞんされます。</p>
        <p>※ がいぶには おくられません。</p>
      </div>
    </div>
  )
}

export default Settings
