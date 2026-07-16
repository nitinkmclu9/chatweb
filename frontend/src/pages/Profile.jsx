import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import api from '../utils/axios'

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    status: user?.status || 'Hey there! I am using Connection Hub'
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { isDark } = useTheme()

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const res = await api.post('/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      updateProfile({ avatar: res.data.avatar })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateProfile(formData)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Update profile error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-neutral-900' : 'bg-neutral-50'} p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-2xl mx-auto">
        <Link to="/" className={`inline-flex items-center gap-2 ${isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'} mb-6 transition-all`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        <div className={`${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'} rounded-2xl shadow-lg-soft overflow-hidden border fade-in`}>
          <div className={`h-32 ${isDark ? 'bg-gradient-to-r from-neutral-700 to-neutral-800' : 'bg-gradient-to-r from-neutral-800 to-black'}`}></div>
          
          <div className="px-4 sm:px-6 pb-6 sm:pb-8">
            <div className="relative -mt-16 mb-4 sm:mb-6 flex items-center justify-center">
              <div className="relative">
                {user?.avatar ? (
                  <img 
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.avatar}`} 
                    alt={user.username} 
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white dark:border-neutral-800 shadow-soft" 
                  />
                ) : (
                  <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full ${isDark ? 'bg-white text-black' : 'bg-black text-white'} flex items-center justify-center text-3xl sm:text-4xl font-bold border-4 border-white dark:border-neutral-800 shadow-soft`}>
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center cursor-pointer transition-all hover:scale-105 shadow-soft">
                  {uploading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white dark:border-black border-t-transparent"></div>
                  ) : (
                    <svg className="w-5 h-5 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>
            </div>

            <div className="text-center mb-4 sm:mb-6">
              <h1 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'} mb-1`}>{user?.username}</h1>
              <p className={isDark ? 'text-neutral-400' : 'text-neutral-500'}>{user?.email}</p>
            </div>

            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 rounded-lg p-3 mb-4 text-sm">
                Profile updated successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-neutral-700'} mb-2`}>Username</label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 ${isDark ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400' : 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400'} border rounded-lg focus:outline-none focus:ring-2 focus:${isDark ? 'ring-white' : 'ring-black'} transition-all`}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-neutral-700'} mb-2`}>Status</label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 ${isDark ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400' : 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400'} border rounded-lg focus:outline-none focus:ring-2 focus:${isDark ? 'ring-white' : 'ring-black'} transition-all`}
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  placeholder="Set your status..."
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-neutral-700'} mb-2`}>Bio</label>
                <textarea
                  rows={4}
                  className={`w-full px-4 py-3 ${isDark ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400' : 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400'} border rounded-lg focus:outline-none focus:ring-2 focus:${isDark ? 'ring-white' : 'ring-black'} resize-none transition-all`}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 ${isDark ? 'bg-white hover:bg-neutral-200 text-black' : 'bg-black hover:bg-neutral-800 text-white'} font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md-soft`}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
