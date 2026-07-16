import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { useTheme } from '../context/ThemeContext'
import api from '../utils/axios'

const IncomingCall = ({ from, signal, callerName, onAccept, onReject }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { socket } = useSocket()
  const { isDark } = useTheme()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/user')
        const found = res.data.find(u => u._id === from)
        if (found) {
          // Store user data if needed
        }
      } catch (err) {
        console.error('Error fetching caller:', err)
      }
    }
    if (from) {
      fetchUser()
    }
  }, [from])

  const handleAccept = () => {
    if (socket && user) {
      socket.emit('accept-call', {
        to: from,
        signal: null // We'll handle signal in VideoCall
      })
    }
    onAccept && onAccept()
  }

  const handleReject = () => {
    if (socket) {
      socket.emit('reject-call', { to: from })
    }
    onReject && onReject()
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-neutral-900' : 'bg-neutral-50'} flex items-center justify-center p-4`}>
      <div className={`${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'} rounded-2xl p-6 sm:p-8 text-center max-w-sm w-full border shadow-lg-soft fade-in`}>
        <div className={`w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-black dark:bg-white flex items-center justify-center animate-pulse`}>
          <svg className={`w-10 h-10 sm:w-12 sm:h-12 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'} mb-2`}>Incoming Call</h2>
        <p className={`${isDark ? 'text-neutral-300' : 'text-neutral-600'} text-lg mb-6 sm:mb-8`}>{callerName || 'Unknown'}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleReject}
            className="w-14 h-14 sm:w-16 sm:h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white transition-all shadow-md-soft"
          >
            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            onClick={handleAccept}
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

export default IncomingCall
