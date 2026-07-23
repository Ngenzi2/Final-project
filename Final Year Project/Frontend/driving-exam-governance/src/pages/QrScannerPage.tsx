import { useState, useRef, useEffect, useCallback } from 'react'
import { CheckCircle2, XCircle, Camera, UserCheck, AlertCircle, ScanLine, Loader2, VideoOff } from 'lucide-react'
import jsQR from 'jsqr'
import { toast } from 'sonner'
import { useOfficerScan } from '../hooks/useOfficer'
import type { OfficerScanResponse } from '../api/officers'
import { EmptyState } from '../components/EmptyState'
import { glassCardClass, glassPanelClass, inputClass, sectionHeaderTextClass, sectionHeaderTitleClass } from '../constants/ui'

const QrScannerPage = () => {
    const { scan, allowEntry, loading } = useOfficerScan()
    const [verificationCode, setVerificationCode] = useState('')
    const [scanResult, setScanResult] = useState<OfficerScanResponse | null>(null)

    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [cameraActive, setCameraActive] = useState(false)
    const [cameraError, setCameraError] = useState<string | null>(null)
    const [retryKey, setRetryKey] = useState(0)

    // Use refs for callbacks to avoid retriggering camera initialization
    const loadingRef = useRef(loading)
    loadingRef.current = loading

    const scanRef = useRef(scan)
    scanRef.current = scan

    const handleScan = useCallback(async (scannedData?: string | any) => {
        const inputData = typeof scannedData === 'string' ? scannedData : verificationCode
        if (!inputData.trim() || loadingRef.current) return

        const promise = scanRef.current(inputData)

        toast.promise(promise, {
            loading: 'Analyzing QR code...',
            success: (data) => {
                setScanResult(data)
                if (data.eligible) return 'Scan successful! Student is eligible for examination.'
                return 'Scan successful, but student is NOT eligible.'
            },
            error: 'Invalid or unregistered QR code detected.'
        })
    }, [verificationCode])

    // Expose a stable ref for the camera tick loop
    const onQrDetectedRef = useRef(handleScan)
    onQrDetectedRef.current = handleScan

    useEffect(() => {
        let isComponentUnmounted = false
        let requestRef: number | null = null
        let streamRef: MediaStream | null = null

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
                if (isComponentUnmounted) {
                    stream.getTracks().forEach(track => track.stop())
                    return
                }
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    videoRef.current.setAttribute("playsinline", "true")
                    videoRef.current.play()
                    streamRef = stream
                    setCameraActive(true)
                    requestRef = requestAnimationFrame(tick)
                }
            } catch (err: any) {
                console.error("Camera Error:", err)
                if (!navigator.mediaDevices) {
                    setCameraError("Browser unsupported or insecure context (needs localhost/HTTPS).")
                } else if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
                    setCameraError("Camera is blocked by your browser. Click the lock icon in your URL bar to allow it, then try again.")
                } else {
                    setCameraError("Camera access denied or device not found.")
                }
            }
        }

        const tick = () => {
            if (isComponentUnmounted || !videoRef.current || !canvasRef.current) return

            if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && !loadingRef.current) {
                const canvas = canvasRef.current
                const video = videoRef.current
                const ctx = canvas.getContext('2d')

                canvas.height = video.videoHeight
                canvas.width = video.videoWidth
                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: "dontInvert",
                    })
                    if (code && code.data) {
                        onQrDetectedRef.current(code.data)
                        // Pause briefly after detecting a scan to avoid spamming
                        setTimeout(() => {
                            if (!isComponentUnmounted) requestRef = requestAnimationFrame(tick)
                        }, 2500)
                        return
                    }
                }
            }
            requestRef = requestAnimationFrame(tick)
        }

        startCamera()
        return () => {
            isComponentUnmounted = true
            if (streamRef) {
                streamRef.getTracks().forEach(track => track.stop())
            }
            if (requestRef) {
                cancelAnimationFrame(requestRef)
            }
        }
    }, [retryKey])

    const handleAllowEntry = async () => {
        if (!scanResult) return
        const promise = allowEntry(scanResult.registrationId)

        toast.promise(promise, {
            loading: 'Logging attendance...',
            success: () => {
                setScanResult(prev => prev ? { ...prev, attended: true, eligible: false, reason: 'Already marked present' } : null)
                return 'Attendance successful. Student allowed entry!'
            },
            error: 'Failed to record attendance.'
        })
    }

    return (
        <div className={`${glassPanelClass} flex flex-col md:flex-row gap-6`}>
            <div className="flex-1 flex flex-col gap-6">
                <div>
                    <h2 className={sectionHeaderTitleClass}>Live QR Scanner</h2>
                    <p className={sectionHeaderTextClass}>Scan incoming student QR codes to verify their payment and examination status in real-time.</p>
                </div>

                {/* Live Camera View */}
                <div className="relative rounded-2xl bg-slate-900 border-4 border-slate-800 overflow-hidden min-h-[340px] flex items-center justify-center shadow-[0_20px_50px_rgba(15,23,42,0.25)]">
                    <canvas ref={canvasRef} className="hidden" />
                    {cameraError ? (
                        <div className="flex flex-col items-center gap-2 text-red-400 z-10 px-8 text-center bg-slate-900/80 p-6 shadow-xl rounded-2xl">
                            <VideoOff size={48} className="text-red-500/80" />
                            <span className="text-sm font-semibold">{cameraError}</span>
                            <span className="text-xs text-slate-400">Please check your browser permissions or click the button below to try again.</span>
                            <button
                                onClick={() => {
                                    setCameraError(null)
                                    setRetryKey(k => k + 1)
                                }}
                                className="mt-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 active:scale-95 text-red-400 rounded-xl font-bold transition-all"
                            >
                                Allow Camera Access
                            </button>
                        </div>
                    ) : (
                        <>
                            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted />
                            {!cameraActive && <Camera size={48} className="text-white/20 animate-pulse z-10" />}

                            <div className={`absolute inset-x-8 top-12 bottom-12 border-2 rounded-xl transition-colors duration-300 z-10 ${loading ? 'border-brand-orange/70' : 'border-dashed border-white/40'}`}>
                                {loading && (
                                    <div className="absolute inset-x-0 top-0 h-0.5 bg-brand-orange/80 shadow-[0_0_12px_2px_rgba(245,158,11,0.6)] animate-scan" />
                                )}
                            </div>
                            <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none z-10" />
                            <div className="absolute bottom-4 left-0 right-0 text-center z-10">
                                <span className="flex items-center justify-center gap-1.5 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm w-fit mx-auto">
                                    {loading && <Loader2 size={12} className="animate-spin" />}
                                    {loading ? 'Analyzing QR code...' : cameraActive ? 'Scanning for QR codes...' : 'Starting camera...'}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Manual Verification */}
                <div className={glassCardClass}>
                    <div className="flex items-center gap-2 mb-3 text-slate-700">
                        <ScanLine size={18} className="text-brand-orange-strong" />
                        <h4 className="font-bold text-sm m-0">Manual Verification</h4>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">If the camera fails, enter the unique verification code printed below the QR code.</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={e => setVerificationCode(e.target.value.toUpperCase())}
                            className={`${inputClass} flex-1 font-mono tracking-wider`}
                            placeholder="e.g. QR-2026-000154"
                            onKeyDown={e => e.key === 'Enter' && handleScan()}
                        />
                        <button
                            onClick={() => handleScan()}
                            disabled={loading || !verificationCode.trim()}
                            className="shrink-0 rounded-xl bg-brand-navy px-6 py-2.5 font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-orange-strong shadow-[0_4px_14px_rgba(18,56,91,0.15)] hover:shadow-[0_10px_24px_rgba(18,56,91,0.25)] active:translate-y-0 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            Verify Code
                        </button>
                    </div>
                </div>
            </div>

            {/* Verification Result Card */}
            <div className="w-full md:w-[400px] flex flex-col gap-4">
                {scanResult ? (
                    <div className={`animate-slide-up flex flex-col items-center text-center !p-8 rounded-2xl bg-white/95 shadow-[0_16px_40px_rgba(15,23,42,0.08)] border-t-4 ${scanResult.eligible ? 'border-emerald-500' : 'border-red-500'}`}>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${scanResult.eligible ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                            {scanResult.eligible ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                        </div>

                        <h3 className="m-0 text-2xl font-bold tracking-tight text-[#1F2937] mb-1">{scanResult.studentName}</h3>
                        <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{scanResult.eligible ? 'VALID TICKET' : 'INVALID TICKET'}</span>
                        <div className="w-full h-px bg-slate-100 my-5" />

                        <div className="w-full flex flex-col gap-3 text-left">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Company / Driving School</label>
                                <div className="text-sm font-semibold text-slate-800">{scanResult.companyName}</div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Teacher</label>
                                <div className="text-sm font-semibold text-slate-800">{scanResult.teacherName}</div>
                            </div>
                            <div className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg border border-slate-100 mt-2">
                                <label className="text-xs font-bold text-slate-700 m-0">Payment Verified</label>
                                {scanResult.paid ? (
                                    <span className="bg-emerald-100 text-emerald-700 px-2 rounded font-bold text-[0.7rem] uppercase tracking-wide">Valid</span>
                                ) : (
                                    <span className="bg-red-100 text-red-700 px-2 rounded font-bold text-[0.7rem] uppercase tracking-wide">Invalid</span>
                                )}
                            </div>
                            <div className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg border border-slate-100">
                                <label className="text-xs font-bold text-slate-700 m-0">System Reason</label>
                                <span className="text-slate-600 font-bold text-[0.75rem]">{scanResult.reason}</span>
                            </div>
                        </div>

                        {scanResult.eligible && (
                            <button
                                onClick={handleAllowEntry}
                                disabled={loading}
                                className={`w-full flex items-center justify-center gap-2 mt-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(16,185,129,0.3)] active:scale-[0.98] ${loading ? 'opacity-70 pointer-events-none' : ''}`}
                            >
                                <UserCheck size={18} />
                                Allow Entry & Record Attendance
                            </button>
                        )}

                        {!scanResult.eligible && (
                            <div className="w-full mt-6 py-3.5 bg-slate-100 text-slate-500 flex items-center justify-center gap-2 rounded-xl font-bold">
                                <AlertCircle size={18} /> Cannot Allow Entry
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 rounded-2xl border border-dashed border-[#E5EAF2] bg-[#f9fbff]/80 backdrop-blur-sm flex items-center justify-center p-8">
                        <EmptyState
                            icon={ScanLine}
                            title="Awaiting QR Scan"
                            description="Scan a student's ticket to load their information."
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default QrScannerPage
