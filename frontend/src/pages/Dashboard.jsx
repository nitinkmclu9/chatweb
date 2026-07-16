import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { useTheme } from '../context/ThemeContext'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const { chats, setSelectedChat, onlineUsers } = useChat()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const getReceiver = (chat) => {
    return chat.users.find((u) => u._id !== user._id)
  }

  const startInstantMeeting = () => {
    if (chats.length > 0) {
      const receiver = getReceiver(chats[0])
      navigate(`/precall/${receiver._id}`)
    } else {
      navigate('/chat')
    }
  }

  const startCameraCheck = () => {
    navigate('/camera-check')
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-neutral-900' : 'bg-neutral-50'}`}>
      <header className={`border-b ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'} sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-white' : 'bg-black'} flex items-center justify-center`}>
                <svg className={`w-6 h-6 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'} hidden sm:block`}>Connection Hub</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all ${isDark ? 'text-white hover:bg-neutral-700' : 'text-neutral-700 hover:bg-neutral-100'}`}
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
              <Link 
                to="/chat" 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${isDark ? 'text-white hover:bg-neutral-700' : 'text-neutral-700 hover:bg-neutral-100'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="hidden sm:inline">Chat</span>
              </Link>
              <button onClick={logout} className={`w-10 h-10 rounded-full ${isDark ? 'bg-white text-black' : 'bg-black text-white'} flex items-center justify-center font-medium`}>
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12 lg:mb-16">
          <div className="order-2 lg:order-1">
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'} mb-3`}>
              Welcome to Connection Hub
            </h1>
            <h2 className={`text-xl sm:text-2xl font-medium ${isDark ? 'text-neutral-300' : 'text-neutral-600'} mb-4`}>
              Professional Chat & Video Calls
            </h2>
            <p className={`${isDark ? 'text-neutral-400' : 'text-neutral-500'} mb-6 leading-relaxed`}>
              Connect with your team, clients, and colleagues with secure, professional video meetings and real-time chat.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={startCameraCheck}
                className={`flex items-center justify-center gap-2 px-6 py-3 ${isDark ? 'bg-white hover:bg-neutral-200 text-black' : 'bg-black hover:bg-neutral-800 text-white'} rounded-xl font-semibold transition-all shadow-md-soft`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Check Camera & Mic
              </button>
              <button
                onClick={startInstantMeeting}
                className={`flex items-center justify-center gap-2 px-6 py-3 ${isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700' : 'bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-300'} rounded-xl font-semibold transition-all shadow-soft`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                New Meeting
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className={`flex-1 flex items-center gap-2 ${isDark ? 'bg-neutral-800 border border-neutral-700' : 'bg-white border border-neutral-300'} rounded-xl overflow-hidden`}>
                <div className="pl-4">
                  <svg className={`w-5 h-5 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Enter a code or link"
                  className={`flex-1 px-4 py-3 bg-transparent border-none outline-none ${isDark ? 'text-white placeholder-neutral-500' : 'text-neutral-900 placeholder-neutral-400'}`}
                />
              </div>
              <button
                className={`px-6 py-3 ${isDark ? 'text-white hover:bg-neutral-700' : 'text-neutral-900 hover:bg-neutral-100'} rounded-xl font-semibold transition-all`}
              >
                Join
              </button>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className={`absolute -inset-2 ${isDark ? 'bg-neutral-700' : 'bg-neutral-200'} rounded-3xl blur-xl opacity-30`}></div>
              <div className={`relative ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'} rounded-2xl border shadow-lg-soft overflow-hidden aspect-video`}>
                <div className={`absolute inset-0 flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-neutral-800 to-neutral-900' : 'bg-gradient-to-br from-neutral-50 to-neutral-100'}`}>
                  <div className="text-center p-8">
                    <div className={`w-20 h-20 ${isDark ? 'bg-white' : 'bg-black'} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <svg className={`w-10 h-10 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <p className={`${isDark ? 'text-neutral-300' : 'text-neutral-600'} font-medium`}>Professional Communication</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12 lg:mb-16">
          <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'} mb-6 text-center`}>
            Professional Features
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {[
              { title: 'HD Video Quality', desc: 'Crystal clear video for professional meetings' },
              { title: 'Secure Calls', desc: 'End-to-end encrypted communication' },
              { title: 'Real-time Chat', desc: 'Instant messaging for quick collaboration' }
            ].map((feature, i) => (
              <div key={i} className={`${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'} rounded-2xl p-6 border shadow-soft hover:shadow-md-soft transition-all`}>
                <div className={`w-12 h-12 ${isDark ? 'bg-neutral-700' : 'bg-neutral-100'} rounded-xl flex items-center justify-center mb-4`}>
                  <svg className={`w-6 h-6 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {i === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />}
                    {i === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />}
                    {i === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />}
                  </svg>
                </div>
                <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-neutral-900'} mb-2`}>{feature.title}</h4>
                <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-600'} leading-relaxed`}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'} mb-6 text-center`}>
            Your Recent Chats
          </h3>
          {chats.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {chats.slice(0, 3).map((chat) => {
                const receiver = getReceiver(chat)
                return (
                  <div 
                    key={chat._id} 
                    className={`${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'} rounded-2xl p-6 border shadow-soft hover:shadow-md-soft transition-all cursor-pointer`}
                    onClick={() => {
                      setSelectedChat(chat)
                      navigate('/chat')
                    }}
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="relative">
                        {receiver?.avatar ? (
                          <img 
                            src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${receiver.avatar}`} 
                            alt={receiver.username}
                            className="w-14 h-14 rounded-full object-cover"
                          />
                        ) : (
                          <div className={`w-14 h-14 rounded-full ${isDark ? 'bg-white text-black' : 'bg-black text-white'} flex items-center justify-center text-xl font-bold`}>
                            {receiver?.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                        {onlineUsers.includes(receiver?._id) && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-neutral-800"></div>
                        )}
                      </div>
                      <div>
                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>{receiver?.username}</h4>
                        <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Click to chat or call</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className={`text-center py-12 ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'} rounded-2xl border shadow-soft`}>
              <div className={`w-16 h-16 ${isDark ? 'bg-neutral-700' : 'bg-neutral-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <svg className={`w-8 h-8 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className={`${isDark ? 'text-neutral-400' : 'text-neutral-500'} mb-4`}>No chats yet</p>
              <button
                onClick={() => navigate('/chat')}
                className={`px-6 py-2 ${isDark ? 'bg-white hover:bg-neutral-200 text-black' : 'bg-black hover:bg-neutral-800 text-white'} rounded-lg font-medium transition-all`}
              >
                Start Chatting
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard
