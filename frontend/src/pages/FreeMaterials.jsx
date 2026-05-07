import { useState, useEffect } from 'react'
import { materialsAPI } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FileText, Download } from 'lucide-react'

const FreeMaterials = () => {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchMaterials()
  }, [])

  const fetchMaterials = async () => {
    try {
      const response = await materialsAPI.getFree()
      setMaterials(response.data)
    } catch (error) {
      toast.error('Failed to load materials')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (materialId, fileName) => {
    try {
      const response = await materialsAPI.download(materialId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Download started!')
    } catch (error) {
      toast.error('Failed to download material')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading materials...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Free Study Materials</h1>
          <p className="text-xl text-gray-600">
            Download free materials without login
          </p>
        </div>

        {materials.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No free materials available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material) => (
              <div key={material.id} className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-lg p-6 border-4 border-green-200 hover:border-green-400 hover:-translate-y-3 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                    FREE
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">{material.title}</h3>
                {material.description && (
                  <p className="text-gray-600 text-sm mb-4">{material.description}</p>
                )}

                {material.category && (
                  <div className="mb-4">
                    <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">Category: {material.category}</span>
                  </div>
                )}

                <button
                  onClick={() => handleDownload(material.id, material.file_name)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2.5 rounded-xl flex items-center justify-center space-x-2 font-bold shadow-md group-hover:shadow-xl transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FreeMaterials
