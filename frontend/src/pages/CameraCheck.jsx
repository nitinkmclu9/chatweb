import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const CameraCheck = () => {
  const [stream, setStream] = useState(null)
  const [muted, setMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const videoRef = useRef()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  const startCamera = async () => {
    try {
      setLoading(true)
      setError('')

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setLoading(false)
    } catch (err) {
      console.error('Error accessing media devices:', err)
      if (err.name === 'NotAllowedError') {
        setError('Please allow camera and microphone access in your browser')
      } else if (err.name === 'NotFoundError') {
        setError('No camera or microphone found')
      } else {
        setError('Error accessing camera and microphone')
      }
      setLoading(false)
    }
  }

  useEffect(() => {
    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const toggleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = muted
        setMuted(!muted)
      }
    }
  }

  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = cameraOff
        setCameraOff(!cameraOff)
      }
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-neutral-900' : 'bg-neutral-50'} flex flex-col items-center justify-center p-4`}>
      <div className="max-w-3xl w-full">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-white' : 'bg-black'} flex items-center justify-center`}>
              <svg className={`w-6 h-6 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className={`text-lg sm:text-xl font-medium ${isDark ? 'text-white' : 'text-neutral-900'}`}>Connection Hub</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all ${isDark ? 'text-white hover:bg-neutral-800' : 'text-neutral-700 hover:bg-neutral-100'}`}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0a4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => navigate('/')}
              className={`flex items-center gap-2 rounded-lg transition-all ${isDark ? 'text-white hover:bg-neutral-800' : 'text-neutral-700 hover:bg-neutral-100'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>
        </div>

        <div className="text-center mb-6 sm:mb-8">
          <h1 className={`text-2xl sm:text-3xl font-medium ${isDark ? 'text-white' : 'text-neutral-900'}`}>Camera & Microphone Check</h1>
        </div>

        <div className={`${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'} rounded-2xl overflow-hidden shadow-lg-soft mb-6 sm:mb-8 border fade-in`}>
          <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-black dark:border-white border-t-transparent mx-auto mb-4"></div>
                <p className={`${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>Requesting camera and microphone access...</p>
                <p className={`${isDark ? 'text-neutral-500' : 'text-neutral-500'} text-sm mt-2`}>Please allow access in the browser popup</p>
              </div>
            ) : error ? (
              <div className="text-center p-6 sm:p-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <svg className="w-8 h-10 sm:w-10 sm:h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className={`text-lg sm:text-xl font-medium ${isDark ? 'text-white' : 'text-neutral-900'} mb-2`}>{error}</h3>
                <button
                  onClick={startCamera}
                  className={`px-6 py-3 ${isDark ? 'bg-white hover:bg-neutral-200 text-black' : 'bg-black hover:bg-neutral-800 text-white'} rounded-lg font-medium transition-all mt-4`}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className={`w-full h-full object-cover ${cameraOff ? 'hidden' : ''}`}
                />
                {cameraOff && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100 dark:bg-neutral-700">
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full ${isDark ? 'bg-white' : 'bg-black'} flex items-center justify-center text-white dark:text-black text-3xl sm:text-4xl font-bold mb-2`}>
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <p className={`${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>Camera is off</p>
                  </div>
                )}
              </>
            )}
          </div>

          {!error && !loading && (
            <div className="p-4 sm:p-6 flex items-center justify-center gap-4 sm:gap-6">
              <button
                onClick={toggleMute}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all ${
                  muted ? 'bg-red-600 hover:bg-red-700' : 'bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                }`}
              >
                <svg className={`w-6 h-6 sm:w-7 sm:h-7 ${muted ? 'text-white' : 'text-neutral-900 dark:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {muted ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  )}
                </svg>
              </button>

              <button
                onClick={toggleCamera}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all ${
                  cameraOff ? 'bg-red-600 hover:bg-red-700' : 'bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                }`}
              >
                <svg className={`w-6 h-6 sm:w-7 sm:h-7 ${cameraOff ? 'text-white' : 'text-neutral-900 dark:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {cameraOff ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  )}
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => navigate('/')}
            className={`px-6 py-3 ${isDark ? 'bg-white hover:bg-neutral-200 text-black' : 'bg-black hover:bg-neutral-800 text-white'} rounded-lg font-medium transition-all shadow-md-soft`}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default CameraCheck
