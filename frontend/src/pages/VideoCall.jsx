import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import SimplePeer from 'simple-peer'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { useChat } from '../context/ChatContext'
import { useTheme } from '../context/ThemeContext'
import api from '../utils/axios'

const VideoCall = () => {
  const [myStream, setMyStream] = useState(null)
  const [userStream, setUserStream] = useState(null)
  const [streamReady, setStreamReady] = useState(false)
  const [callAccepted, setCallAccepted] = useState(false)
  const [muted, setMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)
  const [callEnded, setCallEnded] = useState(false)
  const [otherUser, setOtherUser] = useState(null)
  const [isIncoming, setIsIncoming] = useState(false)
  const [incomingSignal, setIncomingSignal] = useState(null)
  const [callerName, setCallerName] = useState('')
  const [loading, setLoading] = useState(true)

  const myVideoRef = useRef()
  const userVideoRef = useRef()
  const connectionRef = useRef()

  const { userId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { socket } = useSocket()
  const { chats } = useChat()
  const { isDark } = useTheme()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/user')
        const found = res.data.find(u => u._id === userId)
        if (found) {
          setOtherUser(found)
        }
      } catch (err) {
        console.error('Error fetching user:', err)
      }
    }
    fetchUser()
  }, [userId])

  useEffect(() => {
    const incoming = searchParams.get('incoming') === 'true'
    const signal = searchParams.get('signal')
    const name = searchParams.get('callerName')

    if (incoming && signal) {
      setIsIncoming(true)
      setIncomingSignal(JSON.parse(decodeURIComponent(signal)))
      setCallerName(decodeURIComponent(name || ''))
    }
  }, [searchParams])

  useEffect(() => {
    const init = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        setMyStream(mediaStream)
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = mediaStream
        }
        setStreamReady(true)
        setLoading(false)

        if (isIncoming) {

        } else {
          callUser()
        }
      } catch (err) {
        console.error('Error accessing media devices:', err)
        setLoading(false)
      }
    }
    init()

    return () => {
      if (myStream) {
        myStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on('call-accepted', (data) => {
        setCallAccepted(true)
        if (connectionRef.current) {
          connectionRef.current.signal(data.signal)
        }
      })

      socket.on('call-rejected', () => {
        setCallEnded(true)
        setTimeout(() => navigate('/'), 2000)
      })

      socket.on('call-ended', () => {
        setCallEnded(true)
        setTimeout(() => navigate('/'), 2000)
      })
    }

    return () => {
      if (socket) {
        socket.off('call-accepted')
        socket.off('call-rejected')
        socket.off('call-ended')
      }
    }
  }, [socket, navigate])

  const callUser = () => {
    if (!socket || !myStream) return

    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream: myStream
    })

    peer.on('signal', (signal) => {
      socket.emit('call-user', {
        to: userId,
        from: user._id,
        signal: signal,
        callerName: user.username
      })
    })

    peer.on('stream', (stream) => {
      setUserStream(stream)
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream
      }
    })

    connectionRef.current = peer
  }

  const acceptIncomingCall = () => {
    if (!socket || !myStream || !incomingSignal) return

    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream: myStream
    })

    peer.on('signal', (signal) => {
      socket.emit('accept-call', {
        to: userId,
        signal: signal
      })
    })

    peer.on('stream', (stream) => {
      setUserStream(stream)
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream
      }
    })

    peer.signal(incomingSignal)
    connectionRef.current = peer
    setCallAccepted(true)
    setIsIncoming(false)
  }

  const rejectIncomingCall = () => {
    if (socket) {
      socket.emit('reject-call', { to: userId })
    }
    navigate('/')
  }

  const endCall = () => {
    if (socket) {
      socket.emit('end-call', { to: userId })
    }
    if (connectionRef.current) {
      connectionRef.current.destroy()
    }
    setCallEnded(true)
    setTimeout(() => navigate('/'), 2000)
  }

  const toggleMute = () => {
    if (myStream) {
      myStream.getAudioTracks()[0].enabled = muted
      setMuted(!muted)
    }
  }

  const toggleCamera = () => {
    if (myStream) {
      myStream.getVideoTracks()[0].enabled = cameraOff
      setCameraOff(!cameraOff)
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-neutral-900' : 'bg-neutral-50'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
      </div>
    )
  }

  if (isIncoming && !callAccepted) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-neutral-900' : 'bg-neutral-50'} flex items-center justify-center p-4`}>
        <div className={`${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'} rounded-2xl p-6 sm:p-8 text-center max-w-sm w-full border shadow-lg-soft fade-in`}>
          <div className={`w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-black dark:bg-white flex items-center justify-center animate-pulse`}>
            <svg className={`w-10 h-10 sm:w-12 sm:h-12 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'} mb-2`}>Incoming Call</h2>
          <p className={`${isDark ? 'text-neutral-300' : 'text-neutral-600'} text-lg mb-6 sm:mb-8`}>{callerName || otherUser?.username}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={rejectIncomingCall}
              className="w-14 h-14 sm:w-16 sm:h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white transition-all shadow-md-soft"
            >
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={acceptIncomingCall}
              className="w-14 h-14 sm:w-16 sm:h-16 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center text-white transition-all shadow-md-soft"
            >
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (callEnded) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-neutral-900' : 'bg-neutral-50'} flex items-center justify-center`}>
        <div className="text-center fade-in">
          <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'} mb-2`}>Call Ended</h2>
          <p className={`${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-neutral-900' : 'bg-neutral-50'} flex flex-col`}>
      <div className="flex-1 relative">
        <div className="absolute inset-0 bg-black dark:bg-neutral-900">
          <video
            ref={userVideoRef}
            playsInline
            autoPlay
            className={`w-full h-full object-cover ${!callAccepted ? 'hidden' : ''}`}
          />
          {!callAccepted && (
            <div className="w-full h-full flex items-center justify-center bg-neutral-900 border border-neutral-700">
              <div className="text-center">
                <div className={`w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6 rounded-full ${isDark ? 'bg-white' : 'bg-black'} flex items-center justify-center text-black dark:text-white text-3xl sm:text-4xl font-bold animate-pulse border-2 border-neutral-600`}>
                  {otherUser?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <p className="text-neutral-300 text-lg sm:text-xl mb-2">{otherUser?.username}</p>
                <p className="text-neutral-400">Calling...</p>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-4 right-4 w-32 sm:w-40 md:w-48 lg:w-64 rounded-xl overflow-hidden shadow-lg border-2 border-neutral-700">
          <video
            ref={myVideoRef}
            playsInline
            autoPlay
            muted
            className={`w-full h-full object-cover ${cameraOff ? 'hidden' : ''}`}
          />
          {cameraOff && (
            <div className="w-full aspect-video bg-neutral-800 flex items-center justify-center">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full ${isDark ? 'bg-white' : 'bg-black'} flex items-center justify-center text-white dark:text-black text-lg sm:text-2xl font-bold border border-neutral-600`}>
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`p-4 border-t ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={toggleMute}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all ${
              muted ? 'bg-red-600 hover:bg-red-700' : 'bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600'
            }`}
          >
            <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${muted ? 'text-white' : 'text-neutral-900 dark:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${cameraOff ? 'text-white' : 'text-neutral-900 dark:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {cameraOff ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              )}
            </svg>
          </button>

          <button
            onClick={endCall}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all shadow-md-soft"
          >
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoCall
