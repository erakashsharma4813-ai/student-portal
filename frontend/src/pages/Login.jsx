import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authAPI } from '../utils/api'
import toast from 'react-hot-toast'
import { LogIn } from 'lucide-react'

const Login = () => {
  const [formData, setFormData] = useState({
    username: '', // Email is sent as username for OAuth2
    password: '',
  })
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await authAPI.login(new URLSearchParams(formData))
      setAuth(response.data.user, response.data.access_token)
      toast.success('Login successful!')

      // Redirect based on role
      if (response.data.user.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-blue-200">
          <div className="text-center mb-8">
            <LogIn className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900">Login to Your Account</h2>
            <p className="text-gray-600 mt-2">Welcome back! Please enter your details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="username"
                name="username"
                type="email"
                required
                value={formData.username}
                onChange={handleChange}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
