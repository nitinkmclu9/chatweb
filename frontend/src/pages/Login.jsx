import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(formData.email, formData.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-neutral-900' : 'bg-neutral-50'} flex items-center justify-center p-4`}>
      <div className="absolute top-4 right-4">
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
      </div>

      <div className={`w-full max-w-md ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'} rounded-2xl shadow-lg-soft p-8 border fade-in`}>
        <div className="text-center mb-8">
          <div className={`w-16 h-16 ${isDark ? 'bg-white' : 'bg-black'} rounded-xl flex items-center justify-center mx-auto mb-4`}>
            <svg className={`w-8 h-8 ${isDark ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'} mb-2`}>Welcome Back</h1>
          <p className={`${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-neutral-700'} mb-2`}>Email</label>
            <input
              type="email"
              required
              className={`w-full px-4 py-3 ${isDark ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-500' : 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400'} border rounded-lg focus:outline-none focus:ring-2 focus:${isDark ? 'ring-white' : 'ring-black'} transition-all`}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-neutral-700'} mb-2`}>Password</label>
            <input
              type="password"
              required
              className={`w-full px-4 py-3 ${isDark ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-500' : 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400'} border rounded-lg focus:outline-none focus:ring-2 focus:${isDark ? 'ring-white' : 'ring-black'} transition-all`}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
                 <div className="flex justify-end mt-2">
  <Link
    to="/forgot-password"
    className={`text-sm ${
      isDark
        ? "text-neutral-300 hover:text-white"
        : "text-neutral-600 hover:text-black"
    }`}
  >
    Forgot Password?
  </Link>
</div>
          </div>
            
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 ${isDark ? 'bg-white hover:bg-neutral-200 text-black' : 'bg-black hover:bg-neutral-800 text-white'} font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md-soft`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${isDark ? 'border-neutral-700' : 'border-neutral-300'}`}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`px-2 ${isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-white text-neutral-500'}`}>or</span>
          </div>
        </div>

        <button
          onClick={() => {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            // Ensure we have the /api path
            const baseUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl.replace(/\/$/, '')}/api`;
            window.location.href = `${baseUrl}/auth/google`;
          }}
          className={`w-full py-3 flex items-center justify-center gap-3 ${isDark ? 'bg-neutral-700 hover:bg-neutral-600 text-white border border-neutral-600' : 'bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-300'} font-semibold rounded-lg transition-all shadow-md-soft`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p className={`text-center ${isDark ? 'text-neutral-400' : 'text-neutral-600'} mt-6`}>
          Don't have an account?{' '}
          <Link to="/register" className={`font-medium underline ${isDark ? 'text-white hover:text-neutral-300' : 'text-black hover:text-neutral-700'}`}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
