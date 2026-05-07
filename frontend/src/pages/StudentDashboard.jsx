import { useState, useEffect } from 'react'
import { dashboardAPI, materialsAPI, ordersAPI } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { Download, FileText, Package, Calendar, CheckCircle, Clock } from 'lucide-react'

const StudentDashboard = () => {
  const [dashboard, setDashboard] = useState(null)
  const [pendingOrders, setPendingOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    fetchDashboard()
    fetchPendingOrders()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await dashboardAPI.getStudentDashboard()
      setDashboard(response.data)
    } catch (error) {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingOrders = async () => {
    try {
      const response = await ordersAPI.getMyOrders()
      const pending = response.data.filter(order => order.status === 'pending')
      setPendingOrders(pending)
    } catch (error) {
      console.error('Failed to load pending orders')
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.full_name}!</h1>
          <p className="text-gray-600 mt-2">Here's your learning overview</p>
        </div>

        {/* Pending Orders */}
        {pendingOrders.length > 0 && (
          <div className="mb-8">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg shadow-md p-6">
              <div className="flex items-start">
                <Clock className="h-6 w-6 text-yellow-600 mt-1 mr-3" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                    Pending Order{pendingOrders.length > 1 ? 's' : ''} - Awaiting Approval
                  </h3>
                  <p className="text-yellow-800 text-sm mb-4">
                    Your order is pending. We'll contact you soon at <strong>{user?.phone}</strong> for payment details.
                  </p>

                  <div className="space-y-3">
                    {pendingOrders.map((order) => (
                      <div key={order.id} className="bg-white rounded-md p-4 border border-yellow-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">Order #{order.id}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Amount: ₹{order.amount}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Placed on {formatDate(order.created_at)}
                            </p>
                          </div>
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-3 py-1 rounded-full">
                            PENDING
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Purchases */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Package className="h-6 w-6 mr-2 text-primary-600" />
            My Purchased Plans
          </h2>

          {dashboard?.active_purchases?.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">You haven't purchased any plans yet</p>
              <a href="/plans" className="btn-primary">
                Browse Plans
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboard?.active_purchases?.map((purchase) => (
                <div key={purchase.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{purchase.plan?.name}</h3>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>

                  <p className="text-gray-600 text-sm mb-4">{purchase.plan?.description}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        Purchased: {formatDate(purchase.created_at)}
                      </span>
                    </div>
                    {purchase.expires_at ? (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Expires: {formatDate(purchase.expires_at)}</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-green-600 font-medium">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span>Lifetime Access</span>
                      </div>
                    )}
                  </div>

                  {purchase.plan?.materials?.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        {purchase.plan.materials.length} Materials Included
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Purchased Materials */}
        {dashboard?.active_purchases?.some(p => p.plan?.materials?.length > 0) && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-primary-600" />
              Available Materials
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboard?.active_purchases?.flatMap(purchase =>
                purchase.plan?.materials?.map(material => (
                  <div key={`${purchase.id}-${material.id}`} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-primary-100 p-3 rounded-lg">
                        <FileText className="h-6 w-6 text-primary-600" />
                      </div>
                      {material.category && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {material.category}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{material.title}</h3>
                    {material.description && (
                      <p className="text-gray-600 text-sm mb-4">{material.description}</p>
                    )}

                    <div className="text-sm text-gray-500 mb-4">
                      <p>{material.file_name}</p>
                    </div>

                    <button
                      onClick={() => handleDownload(material.id, material.file_name)}
                      className="w-full btn-primary py-2 flex items-center justify-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Free Materials */}
        {dashboard?.free_materials?.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-green-600" />
              Free Materials
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboard.free_materials.map((material) => (
                <div key={material.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      FREE
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{material.title}</h3>
                  {material.description && (
                    <p className="text-gray-600 text-sm mb-4">{material.description}</p>
                  )}

                  <button
                    onClick={() => handleDownload(material.id, material.file_name)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentDashboard
