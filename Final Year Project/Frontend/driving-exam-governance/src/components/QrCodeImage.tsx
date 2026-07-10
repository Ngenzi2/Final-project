import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

type QrCodeImageProps = {
  value: string
  size?: number
}

export const QrCodeImage = ({ value, size = 176 }: QrCodeImageProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      color: { dark: '#14243a', light: '#ffffff' },
    }).catch(() => {})
  }, [value, size])

  return <canvas ref={canvasRef} width={size} height={size} className="rounded-xl" />
}
