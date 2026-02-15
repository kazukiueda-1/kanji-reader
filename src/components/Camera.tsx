import { useRef, useState, useEffect, useCallback } from 'react'
import styles from './Camera.module.css'

interface CameraProps {
  onCapture: (imageData: string) => void
  onBack: () => void
}

function Camera({ onCapture, onBack }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        })
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch {
        if (mounted) {
          setError('カメラをひらけませんでした。カメラのきょかをおねがいします。')
        }
      }
    }

    startCamera()

    return () => {
      mounted = false
      stopCamera()
    }
  }, [stopCamera])

  const handleCapture = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0)
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    setPreview(imageData)
    stopCamera()
  }

  const handleRetake = async () => {
    setPreview(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch {
      setError('カメラをひらけませんでした。')
    }
  }

  const handleUse = () => {
    if (preview) {
      onCapture(preview)
    }
  }

  const handleBack = () => {
    stopCamera()
    onBack()
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>{error}</p>
        <button className={styles.backBtn} onClick={handleBack}>
          もどる
        </button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {preview ? (
        <>
          <img src={preview} alt="さつえいした しゃしん" className={styles.preview} />
          <div className={styles.actions}>
            <button className={styles.retakeBtn} onClick={handleRetake}>
              とりなおす
            </button>
            <button className={styles.useBtn} onClick={handleUse}>
              このしゃしんをつかう
            </button>
          </div>
        </>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={styles.video}
          />
          <div className={styles.actions}>
            <button className={styles.backBtnSmall} onClick={handleBack}>
              もどる
            </button>
            <button className={styles.captureBtn} onClick={handleCapture}>
              <span className={styles.captureBtnInner} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default Camera
