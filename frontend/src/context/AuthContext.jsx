import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const login = async (emailOrToken, password) => {
    let res;
    if (password) {
      // Regular email/password login
      res = await api.post('/auth/login', { email: emailOrToken, password });
    } else {
      // Google OAuth login (token is passed directly)
      const token = emailOrToken;
      localStorage.setItem('token', token);
      // Set the token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Fetch user data
      res = await api.get('/auth/me');
      // Create a user object with token
      res.data = { ...res.data, token };
    }
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data))
    setUser(res.data)
    return res.data
  }

  const register = async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data))
    setUser(res.data)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const updateProfile = async (data) => {
    const res = await api.put('/user/profile', data)
    localStorage.setItem('user', JSON.stringify(res.data))
    setUser(res.data)
    return res.data
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
