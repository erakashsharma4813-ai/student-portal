import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Home, LogOut, User, BookOpen, Menu, X } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMobileMenuOpen(false)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-3 py-1.5 shadow-lg inline-flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-yellow-300" />
                <span className="leading-tight">
                  <span className="block text-lg font-bold">Aatmn Vidya Mandir</span>
                  <span className="block text-xs font-semibold text-blue-100">Student Portal</span>
                </span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center gap-1.5">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link to="/plans" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              Plans
            </Link>
            <Link to="/tuition-info" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              Tuition Info
            </Link>
            <Link to="/free-materials" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              Free Materials
            </Link>

            {user ? (
              <>
                {user.role === 'admin' ? (
                  <Link to="/admin/dashboard" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                    Dashboard
                  </Link>
                )}

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <User className="h-5 w-5" />
                    <span className="text-sm font-medium">{user.full_name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all shadow-md"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-md">
                  Login
                </Link>
                <Link to="/register" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-md">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-primary-600 p-2 rounded-lg"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg border-t border-gray-200">
          <div className="px-4 py-3 space-y-2">
            <Link to="/" onClick={closeMobileMenu} className="block text-gray-700 hover:bg-blue-50 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium">
              <Home className="h-4 w-4 inline mr-2" />
              Home
            </Link>
            <Link to="/plans" onClick={closeMobileMenu} className="block text-gray-700 hover:bg-blue-50 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium">
              Plans
            </Link>
            <Link to="/tuition-info" onClick={closeMobileMenu} className="block text-gray-700 hover:bg-blue-50 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium">
              Tuition Info
            </Link>
            <Link to="/free-materials" onClick={closeMobileMenu} className="block text-gray-700 hover:bg-blue-50 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium">
              Free Materials
            </Link>

            {user ? (
              <>
                {user.role === 'admin' ? (
                  <Link to="/admin/dashboard" onClick={closeMobileMenu} className="block text-gray-700 hover:bg-blue-50 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium">
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link to="/dashboard" onClick={closeMobileMenu} className="block text-gray-700 hover:bg-blue-50 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium">
                    Dashboard
                  </Link>
                )}

                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex items-center px-3 py-2 text-gray-700">
                    <User className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">{user.full_name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all mt-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
                <Link to="/login" onClick={closeMobileMenu} className="block w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 px-5 py-2 rounded-lg text-center font-bold transition-all shadow-md">
                  Login
                </Link>
                <Link to="/register" onClick={closeMobileMenu} className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 px-5 py-2 rounded-lg text-center font-bold transition-all shadow-md">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
