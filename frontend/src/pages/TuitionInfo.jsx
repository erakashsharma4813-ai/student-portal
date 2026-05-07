import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { tuitionInfoAPI } from '../utils/api'
import {
  BookOpen,
  CalendarDays,
  ExternalLink,
  GraduationCap,
  Instagram,
  MapPin,
  Phone
} from 'lucide-react'

const fallbackInfo = [
  {
    id: 'classes',
    title: 'Classes 3rd to 12th',
    description: 'Focused tuition support for school students with regular guidance, practice, and doubt clearing.',
    info_type: 'class_info',
  },
  {
    id: 'tests',
    title: 'Regular Class Tests',
    description: 'Frequent tests help students revise concepts and prepare better for school exams.',
    info_type: 'schedule',
  },
  {
    id: 'subjects',
    title: 'All Subjects Support',
    description: 'Study support, notes, and practice material for students who need stronger basics and exam preparation.',
    info_type: 'subjects',
  },
]

const TuitionInfo = () => {
  const [tuitionInfo, setTuitionInfo] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTuitionInfo = async () => {
      try {
        const response = await tuitionInfoAPI.getPublic()
        setTuitionInfo(response.data)
      } catch (error) {
        setTuitionInfo(fallbackInfo)
      } finally {
        setLoading(false)
      }
    }

    fetchTuitionInfo()
  }, [])

  const displayInfo = tuitionInfo.length > 0 ? tuitionInfo : fallbackInfo

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-white rounded-2xl shadow-xl border-4 border-purple-100 p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 border border-purple-100 rounded-full px-4 py-2 font-bold mb-5">
                <GraduationCap className="h-5 w-5" />
                Tuition Classes
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Aatmn Vidya Mandir
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Detailed information about classes, subjects, batch updates, admissions, and coaching support.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="tel:8627865165" className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl px-5 py-3 inline-flex items-center justify-center gap-2">
                  <Phone className="h-5 w-5" />
                  Call 86278-65165
                </a>
                <Link to="/register" className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl px-5 py-3 text-center">
                  Register Student
                </Link>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-6 border-4 border-orange-300">
              <h2 className="text-2xl font-bold mb-5">Contact and Location</h2>
              <div className="space-y-4">
                <a href="tel:8627865165" className="flex items-start gap-3 bg-white/10 rounded-xl p-4 hover:bg-white/15 transition-colors">
                  <Phone className="h-5 w-5 text-green-300 mt-1" />
                  <div>
                    <p className="text-sm text-slate-300">Phone</p>
                    <p className="font-bold">86278-65165</p>
                  </div>
                </a>
                <a
                  href="https://www.instagram.com/aatmn_vidya_mandir?igsh=MWRlczNxdW9mMWgxZA%3D%3D"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 bg-white/10 rounded-xl p-4 hover:bg-white/15 transition-colors"
                >
                  <Instagram className="h-5 w-5 text-pink-300 mt-1" />
                  <div>
                    <p className="text-sm text-slate-300">Instagram</p>
                    <p className="font-bold flex items-center gap-1">@aatmn_vidya_mandir <ExternalLink className="h-4 w-4" /></p>
                  </div>
                </a>
                <a
                  href="https://maps.app.goo.gl/joeajiKfrJ53NFB68"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 bg-white/10 rounded-xl p-4 hover:bg-white/15 transition-colors"
                >
                  <MapPin className="h-5 w-5 text-orange-300 mt-1" />
                  <div>
                    <p className="text-sm text-slate-300">Address</p>
                    <p className="font-bold">Near Vaishno Gas Agency, Suliali</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Class Information</h2>
          <p className="text-gray-600 mt-1">Admin can update this content from the Tuition Info tab.</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading tuition info...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayInfo.map((info) => (
              <div key={info.id} className="bg-white rounded-2xl shadow-lg border-4 border-blue-100 p-6">
                <div className="bg-blue-100 text-blue-700 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                  {info.info_type === 'schedule' ? (
                    <CalendarDays className="h-7 w-7" />
                  ) : (
                    <BookOpen className="h-7 w-7" />
                  )}
                </div>
                <span className="inline-flex mb-3 px-3 py-1 rounded-full bg-purple-50 text-xs font-bold text-purple-700 border border-purple-100">
                  {info.info_type.replace('_', ' ')}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{info.title}</h3>
                <p className="text-gray-700 leading-relaxed">{info.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TuitionInfo
