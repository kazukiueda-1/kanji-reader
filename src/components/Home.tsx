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

      {/* 背景デコレーション */}
      <div className={styles.deco1}>🌸</div>
      <div className={styles.deco2}>⭐</div>
      <div className={styles.deco3}>🌸</div>
      <div className={styles.deco4}>🎀</div>
      <div className={styles.deco5}>⭐</div>
      <div className={styles.deco6}>💖</div>

      <div className={styles.content}>
        <div className={styles.mascot}>📖</div>
        <h1 className={styles.title}>
          <span className={styles.titleChar1}>か</span>
          <span className={styles.titleChar2}>ん</span>
          <span className={styles.titleChar3}>じ</span>
          <span className={styles.titleChar4}>リ</span>
          <span className={styles.titleChar5}>ー</span>
          <span className={styles.titleChar6}>ダ</span>
          <span className={styles.titleChar7}>ー</span>
        </h1>
        <p className={styles.subtitle}>よめない かんじを<br />カメラで しらべよう！</p>
        <button className={styles.cameraBtn} onClick={onCamera}>
          <span className={styles.cameraIcon}>📷</span>
          <span className={styles.cameraBtnText}>さつえいする</span>
        </button>
        <p className={styles.hint}>かんじを カメラで とってね</p>
      </div>
    </div>
  )
}

export default Home
