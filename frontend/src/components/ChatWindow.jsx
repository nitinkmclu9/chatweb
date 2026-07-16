import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import EmojiPicker from 'emoji-picker-react'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { useSocket } from '../context/SocketContext'
import { useTheme } from '../context/ThemeContext'
import api from '../utils/axios'

const ChatWindow = () => {
  const [newMessage, setNewMessage] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [typing, setTyping] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [editingMessage, setEditingMessage] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [showMessageMenu, setShowMessageMenu] = useState(null)
  const [showReactionPicker, setShowReactionPicker] = useState(null)
  const messagesEndRef = useRef(null)
  const typingTimeout = useRef(null)
  const fileInputRef = useRef(null)
  const { user } = useAuth()
  const { selectedChat, onlineUsers, messages, fetchMessages, sendMessage, editMessage, deleteMessage, addReaction, markAsRead } = useChat()
  const { socket } = useSocket()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id)
      markAsRead()
    }
  }, [selectedChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages, selectedChat])

  useEffect(() => {
    if (socket) {
      socket.on('typing', (data) => {
        if (selectedChat && selectedChat.users.find(u => u._id === data.from)) {
          setTyping(true)
        }
      })

      socket.on('stop-typing', (data) => {
        if (selectedChat && selectedChat.users.find(u => u._id === data.from)) {
          setTyping(false)
        }
      })
    }

    return () => {
      if (socket) {
        socket.off('typing')
        socket.off('stop-typing')
      }
    }
  }, [socket, selectedChat])

  const handleTyping = () => {
    if (!isTyping && socket && selectedChat) {
      setIsTyping(true)
      const chatUserIds = selectedChat.users.map(u => u._id)
      socket.emit('typing', { chatUsers: chatUserIds, from: user._id })
    }

    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      if (socket && selectedChat) {
        setIsTyping(false)
        const chatUserIds = selectedChat.users.map(u => u._id)
        socket.emit('stop-typing', { chatUsers: chatUserIds, from: user._id })
      }
    }, 1500)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (editingMessage) {
      await editMessage(editingMessage._id, editContent)
      setEditingMessage(null)
      setEditContent('')
      return
    }
    if (!newMessage.trim() && selectedFiles.length === 0) return

    await sendMessage(newMessage, selectedFiles)
    
    setNewMessage('')
    setShowEmoji(false)
    setSelectedFiles([])

    if (socket && selectedChat) {
      const receivers = selectedChat.users.filter((u) => u._id !== user._id)
      setIsTyping(false)
      receivers.forEach(receiver => {
        socket.emit('stop-typing', { to: receiver._id, from: user._id })
      })
    }
  }

  const startCall = async () => {
    if (selectedChat.isGroupChat) {
      alert('Group calls not implemented yet')
      return
    }
    const receiver = selectedChat.users.find((u) => u._id !== user._id)
    navigate(`/precall/${receiver._id}`)
  }

  const getChatName = () => {
    if (selectedChat.isGroupChat) {
      return selectedChat.chatName
    }
    const receiver = selectedChat.users.find((u) => u._id !== user._id)
    return receiver?.username || 'Unknown'
  }

  const getChatAvatar = () => {
    if (selectedChat.isGroupChat) {
      if (selectedChat.groupAvatar) {
        return selectedChat.groupAvatar
      }
      return null
    }
    const receiver = selectedChat.users.find((u) => u._id !== user._id)
    return receiver?.avatar
  }

  const getChatStatus = () => {
    if (selectedChat.isGroupChat) {
      return `${selectedChat.users.length} members`
    }
    const receiver = selectedChat.users.find((u) => u._id !== user._id)
    return `${onlineUsers.includes(receiver?._id) ? 'Online' : 'Offline'} • ${receiver?.status || ''}`
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleEdit = (msg) => {
    setEditingMessage(msg)
    setEditContent(msg.content)
    setShowMessageMenu(null)
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }

  const handleDelete = async (msgId) => {
    await deleteMessage(msgId)
    setShowMessageMenu(null)
  }

  // Group reactions by emoji
  const getReactionCounts = (reactions) => {
    const counts = {}
    reactions?.forEach(r => {
      counts[r.emoji] = (counts[r.emoji] || 0) + 1
    })
    return counts
  }

  const chatMessages = messages[selectedChat?._id] || []

  return (
    <div className={`flex-1 flex flex-col ${isDark ? 'bg-neutral-900' : 'bg-neutral-50'}`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            {getChatAvatar() ? (
              <img 
                src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${getChatAvatar()}`} 
                alt={getChatName()}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-white text-black' : 'bg-black text-white'} flex items-center justify-center font-semibold`}>
                {getChatName()?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            {!selectedChat?.isGroupChat && onlineUsers.includes(selectedChat?.users.find(u => u._id !== user._id)?._id) && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-neutral-800"></div>
            )}
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>{getChatName()}</h3>
            <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {getChatStatus()}
            </p>
          </div>
        </div>
        {!selectedChat?.isGroupChat && (
          <button
            onClick={startCall}
            className={`p-2 ${isDark ? 'bg-white hover:bg-neutral-200 text-black' : 'bg-black hover:bg-neutral-800 text-white'} rounded-lg transition-all shadow-soft`}
            title="Start Video Call"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((msg, i) => {
          const isOwn = msg.sender?._id === user._id
          const reactionCounts = getReactionCounts(msg.reactions)
          return (
            <div
              key={msg._id || i}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className="relative">
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isOwn
                      ? `${isDark ? 'bg-white text-black' : 'bg-black text-white'} rounded-tr-sm`
                      : `${isDark ? 'bg-neutral-800 text-white border border-neutral-700' : 'bg-white text-neutral-900 border border-neutral-200'} rounded-tl-sm`
                  }`}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    setShowMessageMenu(showMessageMenu === msg._id ? null : msg._id)
                  }}
                >
                  {!selectedChat?.isGroupChat && !isOwn && (
                    <p className="text-xs font-semibold mb-1 opacity-70">{msg.sender?.username}</p>
                  )}
                  {msg.content && <p>{msg.content}</p>}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.attachments.map((att, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {att.fileType.startsWith('image/') ? (
                            <img
                              src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${att.fileUrl}`}
                              alt={att.fileName}
                              className="rounded-lg max-w-full h-auto max-h-64"
                            />
                          ) : (
                            <a
                              href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${att.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 underline"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>{att.fileName}</span>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-2 mt-1">
                    <p className={`text-xs opacity-70`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {isOwn && msg.isRead && (
                      <span className="text-xs">✓✓</span>
                    )}
                  </div>
                </div>

                {/* Reactions */}
                {Object.keys(reactionCounts).length > 0 && (
                  <div className={`flex gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    {Object.entries(reactionCounts).map(([emoji, count]) => (
                      <button
                        key={emoji}
                        onClick={() => addReaction(msg._id, emoji)}
                        className={`px-2 py-1 rounded-full text-sm ${isDark ? 'bg-neutral-700' : 'bg-neutral-200'}`}
                      >
                        {emoji} {count}
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick Reaction Button */}
                <button
                  onClick={() => setShowReactionPicker(showReactionPicker === msg._id ? null : msg._id)}
                  className={`absolute -bottom-2 ${isOwn ? 'left-2' : 'right-2'} p-1 rounded-full ${isDark ? 'bg-neutral-700' : 'bg-neutral-200'}`}
                >
                  😊
                </button>

                {/* Reaction Picker */}
                {showReactionPicker === msg._id && (
                  <div className={`absolute -top-12 ${isOwn ? 'right-0' : 'left-0'} bg-white dark:bg-neutral-800 rounded-full shadow-lg flex gap-1 p-1 z-20`}>
                    {['👍', '❤️', '😂', '😮', '😢', '😡'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => {
                          addReaction(msg._id, emoji)
                          setShowReactionPicker(null)
                        }}
                        className="w-8 h-8 flex items-center justify-center text-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* Message Menu */}
                {showMessageMenu === msg._id && (
                  <div className={`absolute ${isOwn ? 'right-0' : 'left-0'} top-full mt-2 ${isDark ? 'bg-neutral-800' : 'bg-white'} rounded-lg shadow-lg z-30 min-w-[150px]`}>
                    {isOwn && !msg.isDeleted && (
                      <>
                        <button
                          onClick={() => handleEdit(msg)}
                          className={`w-full text-left px-4 py-2 hover:${isDark ? 'bg-neutral-700' : 'bg-neutral-100'} rounded-t-lg`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(msg._id)}
                          className={`w-full text-left px-4 py-2 hover:${isDark ? 'bg-neutral-700' : 'bg-neutral-100'} text-red-500`}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
        {typing && (
          <div className="flex justify-start">
            <div className={`${isDark ? 'bg-neutral-800 border border-neutral-700' : 'bg-white border border-neutral-200'} rounded-2xl rounded-tl-sm px-4 py-2`}>
              <div className="flex gap-1">
                <div className={`w-2 h-2 ${isDark ? 'bg-neutral-400' : 'bg-neutral-400'} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
                <div className={`w-2 h-2 ${isDark ? 'bg-neutral-400' : 'bg-neutral-400'} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
                <div className={`w-2 h-2 ${isDark ? 'bg-neutral-400' : 'bg-neutral-400'} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className={`p-2 border-t ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className={`relative p-2 rounded-lg ${isDark ? 'bg-neutral-700' : 'bg-neutral-100'} flex items-center gap-2`}>
                {file.type.startsWith('image/') ? (
                  <div className="w-10 h-10 rounded overflow-hidden">
                    <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className={`w-10 h-10 rounded flex items-center justify-center`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
                <span className="text-sm max-w-[100px] truncate">{file.name}</span>
                <button onClick={() => removeFile(index)} className="ml-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className={`p-4 border-t ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
        {editingMessage && (
          <div className={`mb-2 p-2 rounded ${isDark ? 'bg-neutral-700' : 'bg-neutral-100'} flex items-center justify-between`}>
            <span className="text-sm">Editing message...</span>
            <button
              onClick={() => {
                setEditingMessage(null)
                setEditContent('')
              }}
              className="text-sm text-red-500"
            >
              Cancel
            </button>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleFileSelect}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-3 ${isDark ? 'bg-neutral-700 hover:bg-neutral-600 text-white' : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700'} rounded-lg transition-all`}
            title="Attach file"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7.172a4 4 0 00-5.656 0L4.828 11.828a4 4 0 105.656 5.656l4.344-4.344z" />
            </svg>
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmoji(!showEmoji)}
              className={`p-3 ${isDark ? 'bg-neutral-700 hover:bg-neutral-600 text-white' : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700'} rounded-lg transition-all`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0a9 9 0 0118 0z" />
              </svg>
            </button>
            {showEmoji && (
              <div className="absolute bottom-full left-0 mb-2 z-10">
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    if (editingMessage) {
                      setEditContent((prev) => prev + emojiData.emoji)
                    } else {
                      setNewMessage((prev) => prev + emojiData.emoji)
                    }
                    setShowEmoji(false)
                  }}
                  theme={isDark ? 'dark' : 'light'}
                />
              </div>
            )}
          </div>
          <input
            type="text"
            value={editingMessage ? editContent : newMessage}
            onChange={(e) => {
              if (editingMessage) {
                setEditContent(e.target.value)
              } else {
                setNewMessage(e.target.value)
                handleTyping()
              }
            }}
            placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
            className={`flex-1 px-4 py-3 ${isDark ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400' : 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400'} border rounded-lg focus:outline-none focus:ring-2 focus:${isDark ? 'ring-white' : 'ring-black'} transition-all`}
          />
          <button
            type="submit"
            disabled={editingMessage ? !editContent.trim() : (!newMessage.trim() && selectedFiles.length === 0)}
            className={`p-3 ${isDark ? 'bg-white hover:bg-neutral-200 text-black' : 'bg-black hover:bg-neutral-800 text-white'} disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all shadow-soft`}
          >
            {editingMessage ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatWindow
