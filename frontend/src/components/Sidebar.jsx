import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { useTheme } from '../context/ThemeContext'
import api from '../utils/axios'

const Sidebar = () => {
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([])
  const { user, logout } = useAuth()
  const { selectedChat, setSelectedChat, chats, setChats, fetchChats, onlineUsers } = useChat()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleSearch = async (e) => {
    setSearch(e.target.value)
    if (e.target.value) {
      try {
        const res = await api.get(`/user?search=${e.target.value}`)
        setSearchResults(res.data)
      } catch (error) {
        console.error('Search error:', error)
      }
    } else {
      setSearchResults([])
    }
  }

  const accessChat = async (userId) => {
    try {
      const res = await api.post('/chat', { userId })
      if (!chats.find((c) => c._id === res.data._id)) {
        setChats([res.data, ...chats])
      }
      setSelectedChat(res.data)
      setShowSearch(false)
      setSearch('')
      setSearchResults([])
    } catch (error) {
      console.error('Access chat error:', error)
    }
  }

  const getChatName = (chat) => {
    if (chat.isGroupChat) {
      return chat.chatName
    }
    return chat.users.find((u) => u._id !== user._id)?.username
  }

  const getChatAvatar = (chat) => {
    if (chat.isGroupChat) {
      return chat.groupAvatar
    }
    return chat.users.find((u) => u._id !== user._id)?.avatar
  }

  const getChatStatus = (chat) => {
    if (chat.isGroupChat) {
      return `${chat.users.length} members`
    }
    const receiver = chat.users.find((u) => u._id !== user._id)
    return onlineUsers.includes(receiver?._id) ? 'Online' : 'Offline'
  }

  const createGroupChat = async () => {
    if (!groupName || selectedGroupUsers.length < 2) {
      alert('Please enter a group name and select at least 2 users')
      return
    }
    try {
      const res = await api.post('/chat/group', {
        name: groupName,
        users: JSON.stringify(selectedGroupUsers.map(u => u._id))
      })
      setChats([res.data, ...chats])
      setShowGroupModal(false)
      setGroupName('')
      setSelectedGroupUsers([])
    } catch (error) {
      console.error('Create group chat error:', error)
      alert('Failed to create group chat')
    }
  }

  const toggleUserSelection = (userToToggle) => {
    setSelectedGroupUsers(prev => {
      const isSelected = prev.find(u => u._id === userToToggle._id)
      if (isSelected) {
        return prev.filter(u => u._id !== userToToggle._id)
      }
      return [...prev, userToToggle]
    })
  }

  return (
    <div className={`w-full md:w-96 ${isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-neutral-200'} border-r flex flex-col`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDark ? 'border-neutral-700' : 'border-neutral-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-white' : 'bg-black'} flex items-center justify-center`}>
              <svg className={`w-6 h-6 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'} hidden sm:block`}>Connection Hub</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all ${isDark ? 'text-white hover:bg-neutral-800' : 'text-neutral-700 hover:bg-neutral-100'}`}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <Link 
              to="/profile" 
              className={`p-2 rounded-lg transition-all ${isDark ? 'text-white hover:bg-neutral-800' : 'text-neutral-700 hover:bg-neutral-100'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
            <button 
              onClick={logout}
              className={`p-2 rounded-lg transition-all ${isDark ? 'text-white hover:bg-neutral-800' : 'text-neutral-700 hover:bg-neutral-100'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`flex-1 px-4 py-3 ${isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-300 text-neutral-600'} border rounded-lg text-left hover:${isDark ? 'bg-neutral-700' : 'bg-neutral-100'} transition-all`}
          >
            {showSearch ? 'Hide Search' : 'Search users...'}
          </button>
          <button
            onClick={() => setShowGroupModal(true)}
            className={`p-3 ${isDark ? 'bg-white hover:bg-neutral-200 text-black' : 'bg-black hover:bg-neutral-800 text-white'} rounded-lg transition-all shadow-soft`}
            title="New Group Chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      {showSearch && (
        <div className={`p-4 border-b ${isDark ? 'border-neutral-700' : 'border-neutral-200'}`}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={handleSearch}
            className={`w-full px-4 py-3 ${isDark ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400' : 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400'} border rounded-lg focus:outline-none focus:ring-2 focus:${isDark ? 'ring-white' : 'ring-black'} transition-all`}
            autoFocus
          />
          <div className="mt-2 max-h-60 overflow-y-auto">
            {searchResults.map((u) => (
              <div
                key={u._id}
                onClick={() => accessChat(u._id)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${isDark ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`}
              >
                <div className="relative">
                  {u.avatar ? (
                    <img 
                      src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${u.avatar}`} 
                      alt={u.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-white text-black' : 'bg-black text-white'} flex items-center justify-center font-semibold`}>
                      {u?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  {onlineUsers.includes(u._id) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900"></div>
                  )}
                </div>
                <div>
                  <p className={isDark ? 'text-white font-medium' : 'text-neutral-900 font-medium'}>{u.username}</p>
                  <p className={isDark ? 'text-neutral-400 text-sm' : 'text-neutral-500 text-sm'}>{u.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chats */}
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className={`text-sm font-semibold uppercase tracking-wide mb-3 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Chats</h2>
        {chats.map((chat) => {
          const chatName = getChatName(chat)
          const chatAvatar = getChatAvatar(chat)
          return (
            <div
              key={chat._id}
              onClick={() => setSelectedChat(chat)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                selectedChat?._id === chat._id ? (isDark ? 'bg-white text-black' : 'bg-black text-white') : (isDark ? 'hover:bg-neutral-800 text-white' : 'hover:bg-neutral-100 text-neutral-900')
              }`}
            >
              <div className="relative">
                {chatAvatar ? (
                  <img 
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${chatAvatar}`} 
                    alt={chatName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg ${
                    selectedChat?._id === chat._id ? (isDark ? 'bg-black text-white' : 'bg-white text-black') : (isDark ? 'bg-white text-black' : 'bg-black text-white')
                  }`}>
                    {chatName?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                {!chat.isGroupChat && onlineUsers.includes(chat.users.find(u => u._id !== user._id)?._id) && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${
                  selectedChat?._id === chat._id ? (isDark ? 'text-black' : 'text-white') : (isDark ? 'text-white' : 'text-neutral-900')
                }`}>{chatName}</p>
                <p className={`text-sm truncate ${
                  selectedChat?._id === chat._id ? (isDark ? 'text-neutral-700' : 'text-neutral-300') : (isDark ? 'text-neutral-400' : 'text-neutral-500')
                }`}>
                  {chat.latestMessage ? (
                    <>
                      {chat.latestMessage.sender?._id === user._id ? 'You: ' : ''}
                      {chat.latestMessage.content || (chat.latestMessage.attachments?.length > 0 ? '📎 File' : '')}
                    </>
                  ) : (
                    'Start a conversation'
                  )}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Group Chat Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-neutral-800' : 'bg-white'} rounded-2xl p-6 w-full max-w-md`}>
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-neutral-900'}`}>Create Group Chat</h2>
            
            <input
              type="text"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className={`w-full px-4 py-3 mb-4 ${isDark ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400' : 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400'} border rounded-lg focus:outline-none focus:ring-2 focus:${isDark ? 'ring-white' : 'ring-black'} transition-all`}
            />

            <input
              type="text"
              placeholder="Search users to add..."
              value={search}
              onChange={handleSearch}
              className={`w-full px-4 py-3 mb-4 ${isDark ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400' : 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400'} border rounded-lg focus:outline-none focus:ring-2 focus:${isDark ? 'ring-white' : 'ring-black'} transition-all`}
            />

            {selectedGroupUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedGroupUsers.map(u => (
                  <div key={u._id} className={`flex items-center gap-2 px-3 py-1 rounded-full ${isDark ? 'bg-neutral-700 text-white' : 'bg-neutral-100 text-neutral-900'}`}>
                    <span>{u.username}</span>
                    <button onClick={() => toggleUserSelection(u)} className="text-xs">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="max-h-40 overflow-y-auto mb-4">
              {searchResults.map(u => (
                <div
                  key={u._id}
                  onClick={() => toggleUserSelection(u)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                    selectedGroupUsers.find(gu => gu._id === u._id) ? (isDark ? 'bg-neutral-600' : 'bg-neutral-200') : (isDark ? 'hover:bg-neutral-700' : 'hover:bg-neutral-100')
                  }`}
                >
                  {u.avatar ? (
                    <img 
                      src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${u.avatar}`} 
                      alt={u.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-white text-black' : 'bg-black text-white'} flex items-center justify-center font-semibold text-sm`}>
                      {u.username[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className={isDark ? 'text-white' : 'text-neutral-900'}>{u.username}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowGroupModal(false)}
                className={`flex-1 py-3 ${isDark ? 'bg-neutral-700 hover:bg-neutral-600 text-white' : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-900'} rounded-lg transition-all`}
              >
                Cancel
              </button>
              <button
                onClick={createGroupChat}
                className={`flex-1 py-3 ${isDark ? 'bg-white hover:bg-neutral-200 text-black' : 'bg-black hover:bg-neutral-800 text-white'} rounded-lg transition-all shadow-soft`}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar
