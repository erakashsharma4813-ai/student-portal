import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { plansAPI, ordersAPI } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { Package, FileText, Calendar, CheckCircle, Info } from 'lucide-react'

const Plans = () => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await plansAPI.getAll()
      setPlans(response.data)
    } catch (error) {
      toast.error('Failed to load plans')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (planId) => {
    if (!user) {
      toast.error('Please login to place order')
      navigate('/login')
      return
    }

    try {
      // Create order (pending admin approval)
      await ordersAPI.create({ plan_id: planId })

      toast.success(
        `Order placed successfully! We'll contact you at ${user.phone} for payment details.`,
        { duration: 5000 }
      )
      navigate('/dashboard')
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to create order'
      toast.error(errorMsg)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600">
            Select a plan to access premium study materials and exam papers
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8 rounded-lg">
          <div className="flex items-start">
            <Info className="h-6 w-6 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">How Manual Payment Works</h3>
              <p className="text-sm text-blue-700 mt-1">
                After placing an order, our admin will contact you at your registered phone number to coordinate payment (UPI, bank transfer, or cash).
                Once payment is received, your order will be approved instantly and you'll get access to all materials.
              </p>
            </div>
          </div>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No plans available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => {
              const gradients = [
                'from-blue-50 to-cyan-50 border-blue-300 hover:border-blue-500',
                'from-purple-50 to-pink-50 border-purple-300 hover:border-purple-500',
                'from-green-50 to-emerald-50 border-green-300 hover:border-green-500',
                'from-orange-50 to-yellow-50 border-orange-300 hover:border-orange-500',
              ];
              const iconGradients = [
                'from-blue-400 to-cyan-500',
                'from-purple-400 to-pink-500',
                'from-green-400 to-emerald-500',
                'from-orange-400 to-yellow-500',
              ];
              return (
                <div key={plan.id} className={`bg-gradient-to-br ${gradients[index % 4]} rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-4 group`}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`bg-gradient-to-br ${iconGradients[index % 4]} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
                        <Package className="h-8 w-8 text-white" />
                      </div>
                      <span className={`bg-gradient-to-r ${iconGradients[index % 4]} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md`}>
                        {plan.duration_days === 0 ? 'Lifetime' : `${plan.duration_days} Days`}
                      </span>
                    </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>

                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                      {plan.duration_days > 0 && (
                        <span className="ml-2 text-gray-600">/{plan.duration_days} days</span>
                      )}
                    </div>
                  </div>

                  {plan.materials && plan.materials.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>{plan.materials.length} Materials Included</span>
                      </div>
                      <ul className="space-y-2">
                        {plan.materials.slice(0, 3).map((material) => (
                          <li key={material.id} className="flex items-start text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{material.title}</span>
                          </li>
                        ))}
                        {plan.materials.length > 3 && (
                          <li className="text-sm text-gray-500">
                            +{plan.materials.length - 3} more materials
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                    <button
                      onClick={() => handlePurchase(plan.id)}
                      className={`w-full bg-gradient-to-r ${iconGradients[index % 4]} text-white py-3 rounded-xl flex items-center justify-center space-x-2 font-bold shadow-lg hover:shadow-xl transition-all`}
                    >
                      <Calendar className="h-5 w-5" />
                      <span>Place Order</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Plans
