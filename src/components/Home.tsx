import styles from './Home.module.css'

interface HomeProps {
  onCamera: () => void
  onSettings: () => void
}

function Home({ onCamera, onSettings }: HomeProps) {
  return (
    <div className={styles.container}>
      <button className={styles.settingsBtn} onClick={onSettings}>
        ⚙
      </button>
      <div className={styles.content}>
        <h1 className={styles.title}>かんじリーダー</h1>
        <p className={styles.subtitle}>よめないかんじをさつえいしよう！</p>
        <button className={styles.cameraBtn} onClick={onCamera}>
          <span className={styles.cameraIcon}>📷</span>
          <span className={styles.cameraBtnText}>カメラでさつえい</span>
        </button>
      </div>
    </div>
  )
}

export default Home
