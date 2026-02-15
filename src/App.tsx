import { useState, useEffect } from 'react'
import type { Screen, RecognizedKanji } from './types'
import { hasApiKeys } from './services/storage'
import Home from './components/Home'
import Camera from './components/Camera'
import Result from './components/Result'
import Settings from './components/Settings'
import styles from './App.module.css'

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [recognizedKanji, setRecognizedKanji] = useState<RecognizedKanji[]>([])

  useEffect(() => {
    if (!hasApiKeys()) {
      setScreen('settings')
    }
  }, [])

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData)
    setScreen('result')
  }

  const handleBack = () => {
    setScreen('home')
    setCapturedImage(null)
    setRecognizedKanji([])
  }

  return (
    <div className={styles.app}>
      {screen === 'home' && (
        <Home
          onCamera={() => setScreen('camera')}
          onSettings={() => setScreen('settings')}
        />
      )}
      {screen === 'camera' && (
        <Camera
          onCapture={handleCapture}
          onBack={handleBack}
        />
      )}
      {screen === 'result' && capturedImage && (
        <Result
          image={capturedImage}
          kanjiList={recognizedKanji}
          setKanjiList={setRecognizedKanji}
          onBack={handleBack}
        />
      )}
      {screen === 'settings' && (
        <Settings
          onSave={() => setScreen('home')}
          onBack={hasApiKeys() ? () => setScreen('home') : undefined}
        />
      )}
    </div>
  )
}

export default App
