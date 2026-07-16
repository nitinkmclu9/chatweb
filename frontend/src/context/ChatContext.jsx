import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/axios'
import { useAuth } from './AuthContext'
import { useSocket } from './SocketContext'

const ChatContext = createContext()

export const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState(null)
  const [chats, setChats] = useState([])
  const [messages, setMessages] = useState({})
  const [onlineUsers, setOnlineUsers] = useState([])
  const [notification, setNotification] = useState([])
  const { user } = useAuth()
  const { socket } = useSocket()

  const fetchChats = async () => {
    try {
      const res = await api.get('/chat')
      setChats(res.data)
    } catch (error) {
      console.error('Error fetching chats:', error)
    }
  }

  const fetchMessages = async (chatId) => {
    if (!chatId) return
    try {
      const res = await api.get(`/message/${chatId}`)
      setMessages(prev => ({ ...prev, [chatId]: res.data }))
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async (content, attachments = []) => {
    if (!selectedChat || !socket) return
    try {
      const formData = new FormData()
      if (content) formData.append('content', content)
      formData.append('chatId', selectedChat._id)
      attachments.forEach(file => {
        formData.append('attachments', file)
      })

      const res = await api.post('/message', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      setMessages(prev => ({
        ...prev,
        [selectedChat._id]: [...(prev[selectedChat._id] || []), res.data]
      }))
      setChats(prev => prev.map(chat => 
        chat._id === selectedChat._id ? { ...chat, latestMessage: res.data } : chat
      ))

      // Emit socket event for real-time messaging
      const chatUserIds = selectedChat.users.map(u => u._id)
      socket.emit('send-message', {
        message: res.data,
        chatUsers: chatUserIds,
        senderId: user._id
      })
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const editMessage = async (messageId, content) => {
    if (!selectedChat) return
    try {
      const res = await api.put(`/message/${messageId}`, { content })
      setMessages(prev => ({
        ...prev,
        [selectedChat._id]: prev[selectedChat._id].map(msg => 
          msg._id === messageId ? res.data : msg
        )
      }))
    } catch (error) {
      console.error('Error editing message:', error)
    }
  }

  const deleteMessage = async (messageId) => {
    if (!selectedChat) return
    try {
      const res = await api.delete(`/message/${messageId}`)
      setMessages(prev => ({
        ...prev,
        [selectedChat._id]: prev[selectedChat._id].map(msg => 
          msg._id === messageId ? res.data : msg
        )
      }))
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const addReaction = async (messageId, emoji) => {
    if (!selectedChat) return
    try {
      const res = await api.post(`/message/${messageId}/reactions`, { emoji })
      setMessages(prev => ({
        ...prev,
        [selectedChat._id]: prev[selectedChat._id].map(msg => 
          msg._id === messageId ? res.data : msg
        )
      }))
    } catch (error) {
      console.error('Error adding reaction:', error)
    }
  }

  const markAsRead = async () => {
    if (!selectedChat) return
    try {
      await api.post(`/message/${selectedChat._id}/read`)
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const addMessage = (message) => {
    if (selectedChat?._id === message.chat._id) {
      setMessages(prev => ({
        ...prev,
        [message.chat._id]: [...(prev[message.chat._id] || []), message]
      }))
    } else {
      setNotification(prev => {
        const isDuplicate = prev.some(n => n._id === message._id)
        if (!isDuplicate) return [message, ...prev]
        return prev
      })
    }
    setChats(prev => prev.map(chat => 
      chat._id === message.chat._id ? { ...chat, latestMessage: message } : chat
    ))
  }

  useEffect(() => {
    if (user) {
      fetchChats()
    }
  }, [user])

  return (
    <ChatContext.Provider value={{
      selectedChat,
      setSelectedChat,
      chats,
      setChats,
      onlineUsers,
      setOnlineUsers,
      fetchChats,
      messages,
      setMessages,
      fetchMessages,
      sendMessage,
      editMessage,
      deleteMessage,
      addReaction,
      markAsRead,
      addMessage,
      notification,
      setNotification
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => useContext(ChatContext)
