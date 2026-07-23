import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { CameraOff } from 'lucide-react'

type QrScannerProps = {
  active: boolean
  onScan: (value: string) => void
}

export const QrScanner = ({ active, onScan }: QrScannerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)

  useEffect(() => {
    if (!active) return

    let cancelled = false

    const tick = () => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const context = canvas.getContext('2d')
        if (context) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          context.drawImage(video, 0, 0, canvas.width, canvas.height)
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height)
          if (code?.data) {
            onScan(code.data)
            return
          }
        }
      }
      frameRef.current = requestAnimationFrame(tick)
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
        frameRef.current = requestAnimationFrame(tick)
      })
      .catch(() => setCameraError('Camera access was denied or is unavailable on this device.'))

    return () => {
      cancelled = true
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [active, onScan])

  if (!active) return null

  if (cameraError) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
        <CameraOff size={22} className="shrink-0 text-red-500" />
        <p className="m-0 text-[0.9rem] text-[#6B7280]">{cameraError}</p>
      </div>
    )
  }

  return (
    <div className="relative mx-auto aspect-square w-full max-w-80 overflow-hidden rounded-2xl border-2 border-brand-orange/40 bg-black">
      <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
      <canvas ref={canvasRef} className="hidden" />
      <div className="pointer-events-none absolute inset-6 rounded-xl border-2 border-white/70" />
    </div>
  )
}
