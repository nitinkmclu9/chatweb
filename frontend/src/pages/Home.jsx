import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const Home = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isDark } = useTheme()

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  return (
    <div className={`min-h-screen ${isDark ? 'bg-neutral-900' : 'bg-neutral-50'} flex items-center justify-center p-4`}>
      <div className="max-w-4xl w-full text-center fade-in">
        <div className="mb-8 sm:mb-12">
          <div className={`w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 rounded-full ${isDark ? 'bg-white' : 'bg-black'} flex items-center justify-center shadow-lg-soft`}>
            <svg className={`w-12 h-12 sm:w-16 sm:h-16 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black mb-4 ${isDark ? 'text-white' : 'text-neutral-900'}`}>VibeConnect</h1>
          <p className={`text-lg sm:text-xl lg:text-2xl ${isDark ? 'text-neutral-400' : 'text-neutral-500'} mb-8 sm:mb-12`}>Connect with friends instantly through chat and video calls</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <button
            onClick={() => navigate('/login')}
            className={`w-full sm:w-auto px-10 py-4 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:scale-105 transition-all shadow-lg-soft`}
          >
            Get Started
          </button>
        </div>

        <div className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className={`${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'} rounded-xl p-6 border shadow-md-soft slide-up`}>
            <div className={`w-12 h-12 mx-auto mb-4 rounded-lg ${isDark ? 'bg-white' : 'bg-black'} flex items-center justify-center`}>
              <svg className={`w-6 h-6 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-neutral-900'}`}>Real-time Chat</h3>
            <p className={`${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Send and receive messages instantly</p>
          </div>

          <div className={`${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'} rounded-xl p-6 border shadow-md-soft slide-up animation-delay-100`}>
            <div className={`w-12 h-12 mx-auto mb-4 rounded-lg ${isDark ? 'bg-white' : 'bg-black'} flex items-center justify-center`}>
              <svg className={`w-6 h-6 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-neutral-900'}`}>Video Calls</h3>
            <p className={`${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>High-quality video conversations</p>
          </div>

          <div className={`${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'} rounded-xl p-6 border shadow-md-soft slide-up animation-delay-200`}>
            <div className={`w-12 h-12 mx-auto mb-4 rounded-lg ${isDark ? 'bg-white' : 'bg-black'} flex items-center justify-center`}>
              <svg className={`w-6 h-6 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-neutral-900'}`}>Secure & Private</h3>
            <p className={`${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Your conversations are protected</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
