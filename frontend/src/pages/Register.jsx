import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../utils/api'
import toast from 'react-hot-toast'
import { UserPlus, Shield, CheckCircle } from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    full_name: '',
    password: '',
    confirmPassword: '',
  })
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpEnabled, setOtpEnabled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if OTP verification is enabled
    const checkOTPConfig = async () => {
      try {
        const response = await authAPI.getOTPConfig()
        setOtpEnabled(response.data.otp_enabled)
      } catch (error) {
        // If config check fails, assume OTP is disabled
        setOtpEnabled(false)
      }
    }
    checkOTPConfig()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    // Reset verification if phone changes
    if (e.target.name === 'phone') {
      setOtpSent(false)
      setPhoneVerified(false)
      setOtp('')
    }
  }

  const handleSendOTP = async () => {
    if (!formData.phone) {
      toast.error('Please enter phone number')
      return
    }

    setOtpLoading(true)
    try {
      await authAPI.sendOTP(formData.phone)
      setOtpSent(true)
      toast.success('OTP sent to your phone number!')
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to send OTP'
      toast.error(errorMsg)
    } finally {
      setOtpLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp) {
      toast.error('Please enter OTP')
      return
    }

    setOtpLoading(true)
    try {
      await authAPI.verifyOTP(formData.phone, otp)
      setPhoneVerified(true)
      toast.success('Phone number verified successfully!')
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Invalid OTP'
      toast.error(errorMsg)
    } finally {
      setOtpLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Only check phone verification if OTP is enabled
    if (otpEnabled && !phoneVerified) {
      toast.error('Please verify your phone number with OTP')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const { confirmPassword, ...registerData } = formData
      await authAPI.register(registerData)
      toast.success('Registration successful! Please login.')
      navigate('/login')
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Registration failed'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-purple-200">
          <div className="text-center mb-8">
            <UserPlus className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-600 mt-2">Join us to access quality study materials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                value={formData.full_name}
                onChange={handleChange}
                className="input-field"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number {otpEnabled && phoneVerified && <CheckCircle className="inline h-4 w-4 text-green-600 ml-1" />}
              </label>
              <div className="flex gap-2">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={otpEnabled && phoneVerified}
                  className="input-field flex-1"
                  placeholder="9876543210 or +919876543210"
                />
                {otpEnabled && !phoneVerified && (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={otpLoading || !formData.phone}
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-cyan-700 font-medium disabled:opacity-50 whitespace-nowrap"
                  >
                    {otpLoading ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Indian: 10 digits (6-9 start) or with +91. International: +country code
              </p>
            </div>

            {otpEnabled && otpSent && !phoneVerified && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <label htmlFor="otp" className="block text-sm font-medium text-blue-900 mb-2">
                      Enter OTP
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="otp"
                        type="text"
                        maxLength="6"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="input-field flex-1"
                        placeholder="6-digit OTP"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={otpLoading || !otp}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 font-medium disabled:opacity-50"
                      >
                        {otpLoading ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">OTP sent to {formData.phone}. Valid for 10 minutes.</p>
                  </div>
                </div>
              </div>
            )}

            {otpEnabled && phoneVerified && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">Phone number verified!</p>
                  <p className="text-xs text-green-700">You can now complete your registration</p>
                </div>
              </div>
            )}

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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
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
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
