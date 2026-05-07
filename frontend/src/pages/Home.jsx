import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { materialsAPI, noticesAPI } from '../utils/api'
import {
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  Download,
  ExternalLink,
  FileText,
  Instagram,
  MapPin,
  Pencil,
  Plane,
  Phone,
  Stethoscope,
  Wrench,
  Users
} from 'lucide-react'

const fallbackNotices = [
  {
    id: 'welcome',
    title: 'Welcome to Aatmn Vidya Mandir',
    message: 'Latest announcements, activities, and study updates from the coaching center will appear here.',
    notice_type: 'announcement',
    created_at: new Date().toISOString(),
  },
]

const Home = () => {
  const { user } = useAuthStore()
  const [freeMaterials, setFreeMaterials] = useState([])
  const [notices, setNotices] = useState([])

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [materialsResponse, noticesResponse] = await Promise.all([
          materialsAPI.getFree(),
          noticesAPI.getPublic(),
        ])
        setFreeMaterials(materialsResponse.data.slice(0, 3))
        setNotices(noticesResponse.data.slice(0, 4))
      } catch (error) {
        setNotices(fallbackNotices)
      }
    }

    fetchHomeData()
  }, [])

  const displayNotices = notices.length > 0 ? notices : fallbackNotices

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="absolute right-0 top-8 w-80 h-80 bg-gradient-to-br from-orange-300 to-yellow-300 rounded-[42%_58%_60%_40%/50%_35%_65%_50%] opacity-60 blob-animate"></div>
        <div className="absolute left-8 bottom-2 w-40 h-40 bg-gradient-to-br from-violet-400 to-purple-400 rounded-[65%_35%_40%_60%/40%_45%_55%_60%] opacity-50 blob-animate" style={{animationDelay: '2s'}}></div>
        <div className="absolute right-20 bottom-20 w-24 h-24 bg-gradient-to-br from-pink-300 to-rose-300 rounded-full opacity-40 blob-animate" style={{animationDelay: '4s'}}></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative">
          <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Welcome to Aatmn Vidya Mandir
          </h1>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 border border-purple-200 text-purple-700 font-bold mb-5 shadow-sm">
            Student Portal
          </div>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
            Tuition classes for focused learning, quality study materials, exam papers, and learning resources.
            Access free materials or purchase plans for premium content.
          </p>

          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            {user ? (
              <>
                <Link to="/plans" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg px-8 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 hover:-translate-y-1 hover:shadow-2xl transition-all shadow-lg">
                  Browse Plans
                </Link>
                <Link to="/free-materials" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-lg px-8 py-3 rounded-xl font-bold hover:from-cyan-600 hover:to-blue-600 hover:-translate-y-1 hover:shadow-2xl transition-all shadow-lg">
                  Free Materials
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-lg px-8 py-3 rounded-xl font-bold hover:from-green-500 hover:to-emerald-600 hover:-translate-y-1 hover:shadow-2xl transition-all shadow-lg">
                  Get Started
                </Link>
                <Link to="/login" className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-lg px-8 py-3 rounded-xl font-bold hover:from-orange-500 hover:to-red-600 hover:-translate-y-1 hover:shadow-2xl transition-all shadow-lg">
                  Login
                </Link>
              </>
            )}
          </div>
          </div>

          <div className="relative min-h-[360px] hidden lg:block">
            <div className="career-dream-scene">
              <div className="dream-path"></div>

              <div className="career-card career-doctor">
                <div className="career-icon bg-rose-500">
                  <Stethoscope className="h-8 w-8 text-white" />
                </div>
                <span>Doctor</span>
              </div>

              <div className="career-card career-pilot">
                <div className="career-icon bg-sky-500">
                  <Plane className="h-8 w-8 text-white" />
                </div>
                <span>Pilot</span>
              </div>

              <div className="career-card career-engineer">
                <div className="career-icon bg-amber-500">
                  <Wrench className="h-8 w-8 text-white" />
                </div>
                <span>Engineer</span>
              </div>

              <div className="study-desk">
                <div className="student-head">
                  <span className="student-hair"></span>
                </div>
                <div className="student-body"></div>
                <div className="desk-top">
                  <BookOpen className="h-12 w-12 text-blue-600" />
                  <Pencil className="h-8 w-8 text-yellow-500 pencil-write" />
                </div>
                <div className="desk-leg left-leg"></div>
                <div className="desk-leg right-leg"></div>
                <div className="study-label">Study Today</div>
              </div>

              <div className="future-ribbon">
                Future Dreams
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notice Board and Free Samples */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="chalkboard p-10 rounded-2xl shadow-2xl border-[16px] border-amber-800 relative overflow-hidden">
            {/* Wooden frame details */}
            <div className="absolute left-0 right-0 bottom-0 h-5 bg-gradient-to-b from-amber-900 to-amber-950"></div>
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-amber-950 to-amber-900"></div>
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-amber-950 to-amber-900"></div>

            {/* Chalk holder */}
            <div className="absolute bottom-3 right-6 flex gap-2">
              <div className="w-16 h-3 bg-white/90 rounded-full shadow-md"></div>
              <div className="w-14 h-3 bg-yellow-100 rounded-full shadow-md"></div>
              <div className="w-12 h-3 bg-pink-200 rounded-full shadow-md"></div>
            </div>

            <div className="flex items-center justify-center mb-8 relative z-10">
              <div className="bg-yellow-300/20 p-4 rounded-full mr-4 border-3 border-yellow-200/40">
                <Bell className="h-10 w-10 text-yellow-100" />
              </div>
              <div className="relative">
                <h2 className="text-4xl font-bold text-yellow-50 chalk-text">Notice Board</h2>
                <p className="text-base text-yellow-100/80 chalk-text">Latest Updates</p>
              </div>
            </div>

            <div className="space-y-5 relative z-10">
              {displayNotices.map((notice, index) => {
                const typeColors = {
                  0: 'text-yellow-200',
                  1: 'text-cyan-200',
                  2: 'text-pink-200'
                };
                return (
                  <div key={notice.id} className="chalk-notice p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-sm font-bold uppercase chalk-text ${typeColors[index % 3]}`}>
                        {notice.notice_type}
                      </span>
                      <span className="text-sm text-lime-200 flex items-center chalk-text">
                        <CalendarDays className="h-4 w-4 mr-2" />
                        {formatDate(notice.created_at)}
                      </span>
                    </div>
                    <h3 className="font-bold text-white mb-2 chalk-text text-xl">{notice.title}</h3>
                    <p className="text-base text-emerald-100 chalk-text leading-relaxed">{notice.message}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Free Sample Study Materials</h2>
                <p className="text-gray-600">Try sample materials before choosing a plan.</p>
              </div>
              <Link to="/free-materials" className="text-primary-600 hover:text-primary-700 font-medium">
                View all free materials
              </Link>
            </div>

            {freeMaterials.length === 0 ? (
              <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg text-center border-4 border-gray-200">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No free sample materials available yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {freeMaterials.map((material) => (
                  <Link key={material.id} to="/free-materials" className="block bg-gradient-to-br from-white to-green-50 p-6 rounded-2xl shadow-lg border-4 border-green-200 hover:border-green-400 hover:-translate-y-3 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                        FREE
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">{material.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {material.description || 'Free sample study material for students.'}
                    </p>
                    <span className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all font-bold shadow-md group-hover:shadow-xl">
                      <Download className="h-4 w-4" />
                      <span>Open Sample</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="absolute right-8 top-0 w-32 h-32 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-[45%_55%_50%_50%/60%_40%_60%_40%] blob-animate opacity-50"></div>

        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-3">Why Choose Us?</h2>
          <p className="text-lg text-gray-600">Explore amazing features designed just for you!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Link to="/free-materials" className="block bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl shadow-lg text-center border-4 border-blue-200 hover:border-blue-400 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <div className="bg-gradient-to-br from-blue-400 to-cyan-500 p-4 rounded-full w-20 h-20 mx-auto mb-4 shadow-lg">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-blue-900">Quality Materials</h3>
            <p className="text-blue-700 font-medium">Access high-quality study materials and exam papers</p>
          </Link>

          <Link to="/register" className="block bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl shadow-lg text-center border-4 border-green-200 hover:border-green-400 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-4 rounded-full w-20 h-20 mx-auto mb-4 shadow-lg">
              <Users className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-green-900">Easy Registration</h3>
            <p className="text-green-700 font-medium">Quick sign-up process with phone verification</p>
          </Link>

          <Link to="/plans" className="block bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl shadow-lg text-center border-4 border-purple-200 hover:border-purple-400 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <div className="bg-gradient-to-br from-purple-400 to-pink-500 p-4 rounded-full w-20 h-20 mx-auto mb-4 shadow-lg">
              <Award className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-purple-900">Flexible Plans</h3>
            <p className="text-purple-700 font-medium">Choose from various plans that suit your needs</p>
          </Link>

          <Link to="/dashboard" className="block bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-2xl shadow-lg text-center border-4 border-orange-200 hover:border-orange-400 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <div className="bg-gradient-to-br from-orange-400 to-yellow-500 p-4 rounded-full w-20 h-20 mx-auto mb-4 shadow-lg">
              <Download className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-orange-900">Unlimited Downloads</h3>
            <p className="text-orange-700 font-medium">Download purchased materials anytime, anywhere</p>
          </Link>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 bg-slate-900 text-white rounded-2xl p-6 shadow-xl border-4 border-orange-300">
            <div>
              <h2 className="text-2xl font-bold">Contact Aatmn Vidya Mandir</h2>
              <p className="text-slate-200 mt-1">Near Vaishno Gas Agency, Suliali</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:min-w-[620px]">
              <a
                href="tel:8627865165"
                className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl px-4 py-3 transition-colors"
              >
                <Phone className="h-5 w-5 text-green-300 mb-2" />
                <p className="text-sm text-slate-300">Call</p>
                <p className="font-bold">86278-65165</p>
              </a>

              <a
                href="https://www.instagram.com/aatmn_vidya_mandir?igsh=MWRlczNxdW9mMWgxZA%3D%3D"
                target="_blank"
                rel="noreferrer"
                className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl px-4 py-3 transition-colors"
              >
                <Instagram className="h-5 w-5 text-pink-300 mb-2" />
                <p className="text-sm text-slate-300">Instagram</p>
                <p className="font-bold flex items-center gap-1">@aatmn_vidya_mandir <ExternalLink className="h-3.5 w-3.5" /></p>
              </a>

              <a
                href="https://maps.app.goo.gl/joeajiKfrJ53NFB68"
                target="_blank"
                rel="noreferrer"
                className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl px-4 py-3 transition-colors"
              >
                <MapPin className="h-5 w-5 text-orange-300 mb-2" />
                <p className="text-sm text-slate-300">Location</p>
                <p className="font-bold flex items-center gap-1">Google Maps <ExternalLink className="h-3.5 w-3.5" /></p>
              </a>
            </div>

            <Link to="/tuition-info" className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl px-5 py-3 text-center transition-colors">
              Tuition Details
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">How It Works</h2>
          <p className="text-center text-lg text-gray-600 mb-12">Getting started is super easy!</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group hover:-translate-y-2 transition-all duration-300">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 border-4 border-blue-200">
                1
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Register & Login</h3>
              <p className="text-gray-700 font-medium">Create your account with email and phone number</p>
            </div>

            <div className="text-center group hover:-translate-y-2 transition-all duration-300">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 border-4 border-green-200">
                2
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Choose a Plan</h3>
              <p className="text-gray-700 font-medium">Browse plans and place an order for materials you need</p>
            </div>

            <div className="text-center group hover:-translate-y-2 transition-all duration-300">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 border-4 border-orange-200">
                3
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Start Learning</h3>
              <p className="text-gray-700 font-medium">Access and download your materials instantly</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
