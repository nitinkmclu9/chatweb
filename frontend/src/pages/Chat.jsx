import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { useChat } from '../context/ChatContext'
import { useTheme } from '../context/ThemeContext'
import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'
import api from '../utils/axios'

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { socket } = useSocket()
  const { messages, addMessage, chats } = useChat()
  const { isDark } = useTheme()

  useEffect(() => {
    if (userId) {
      const fetchUser = async () => {
        try {
          const res = await api.get('/user')
          const found = res.data.find(u => u._id === userId)
          if (found) {
            setSelectedUser(found)
          }
        } catch (err) {
          console.error('Error fetching user:', err)
        }
      }
      fetchUser()
    }
  }, [userId])

  useEffect(() => {
    if (socket) {
      socket.on('receive-message', (data) => {
        addMessage(data)
      })
    }
    return () => {
      if (socket) {
        socket.off('receive-message')
      }
    }
  }, [socket, addMessage])

  if (!user) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-neutral-900' : 'bg-neutral-50'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-neutral-900' : 'bg-neutral-50'} flex`}>
      <div className={`${isSidebarOpen ? 'flex' : 'hidden'} md:flex w-full md:w-80 flex-shrink-0`}>
        <Sidebar
          selectedUser={selectedUser}
          onSelectUser={(u) => navigate(`/chat/${u._id}`)}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0">
        {selectedUser ? (
          <ChatWindow
            selectedUser={selectedUser}
            messages={messages[selectedUser._id] || []}
            onBack={() => setIsSidebarOpen(true)}
            showBackButton={!isSidebarOpen}
          />
        ) : (
          <div className={`flex-1 flex items-center justify-center ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            <div className="text-center">
              <svg className={`w-24 h-24 mx-auto mb-4 opacity-20`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-lg">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat
