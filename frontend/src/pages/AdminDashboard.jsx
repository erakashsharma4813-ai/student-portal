import { useState, useEffect } from 'react'
import { dashboardAPI, materialsAPI, noticesAPI, plansAPI, ordersAPI, tuitionInfoAPI, usersAPI } from '../utils/api'
import toast from 'react-hot-toast'
import {
  Package,
  FileText,
  Users,
  DollarSign,
  Upload,
  PlusCircle,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Bell,
  Pencil,
  Save,
  Info,
  UserCheck,
  UserX
} from 'lucide-react'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboard, setDashboard] = useState(null)
  const [materials, setMaterials] = useState([])
  const [plans, setPlans] = useState([])
  const [pendingOrders, setPendingOrders] = useState([])
  const [notices, setNotices] = useState([])
  const [tuitionInfo, setTuitionInfo] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingNoticeId, setEditingNoticeId] = useState(null)
  const [editingTuitionInfoId, setEditingTuitionInfoId] = useState(null)

  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    material_type: 'free',
    category: '',
    file: null,
  })

  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    price: '',
    duration_days: '30',
    material_ids: [],
  })

  const [noticeForm, setNoticeForm] = useState({
    title: '',
    message: '',
    notice_type: 'announcement',
    is_active: true,
  })

  const [tuitionInfoForm, setTuitionInfoForm] = useState({
    title: '',
    description: '',
    info_type: 'class_info',
    is_active: true,
  })

  useEffect(() => {
    fetchDashboard()
    fetchMaterials()
    fetchPlans()
    fetchPendingOrders()
    fetchNotices()
    fetchTuitionInfo()
    fetchUsers()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await dashboardAPI.getAdminDashboard()
      setDashboard(response.data)
    } catch (error) {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchMaterials = async () => {
    try {
      const response = await materialsAPI.getAll()
      setMaterials(response.data)
    } catch (error) {
      toast.error('Failed to load materials')
    }
  }

  const fetchPlans = async () => {
    try {
      const response = await plansAPI.getAll()
      setPlans(response.data)
    } catch (error) {
      toast.error('Failed to load plans')
    }
  }

  const fetchPendingOrders = async () => {
    try {
      const response = await ordersAPI.getPendingOrders()
      setPendingOrders(response.data)
    } catch (error) {
      toast.error('Failed to load pending orders')
    }
  }

  const fetchNotices = async () => {
    try {
      const response = await noticesAPI.getAdmin()
      setNotices(response.data)
    } catch (error) {
      toast.error('Failed to load notices')
    }
  }

  const fetchTuitionInfo = async () => {
    try {
      const response = await tuitionInfoAPI.getAdmin()
      setTuitionInfo(response.data)
    } catch (error) {
      toast.error('Failed to load tuition info')
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll()
      setUsers(response.data)
    } catch (error) {
      toast.error('Failed to load users')
    }
  }

  const handleToggleUserActive = async (userId) => {
    try {
      await usersAPI.toggleActive(userId)
      toast.success('User status updated successfully!')
      fetchUsers()
      fetchDashboard()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update user status')
    }
  }

  const handleApproveOrder = async (orderId) => {
    if (!window.confirm('Approve this order? This will grant the student access to materials.')) return
    try {
      await ordersAPI.approve(orderId)
      toast.success('Order approved successfully!')
      fetchPendingOrders()
      fetchDashboard()
    } catch (error) {
      toast.error('Failed to approve order')
    }
  }

  const handleRejectOrder = async (orderId) => {
    if (!window.confirm('Reject this order? This action cannot be undone.')) return
    try {
      await ordersAPI.reject(orderId)
      toast.success('Order rejected')
      fetchPendingOrders()
      fetchDashboard()
    } catch (error) {
      toast.error('Failed to reject order')
    }
  }

  const handleUploadMaterial = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('title', uploadForm.title)
    formData.append('description', uploadForm.description)
    formData.append('material_type', uploadForm.material_type)
    formData.append('category', uploadForm.category)
    formData.append('file', uploadForm.file)

    try {
      await materialsAPI.upload(formData)
      toast.success('Material uploaded successfully!')
      setUploadForm({
        title: '',
        description: '',
        material_type: 'free',
        category: '',
        file: null,
      })
      fetchMaterials()
      fetchDashboard()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upload material')
    }
  }

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Delete this material? This action cannot be undone.')) return
    try {
      await materialsAPI.delete(id)
      toast.success('Material deleted successfully!')
      fetchMaterials()
      fetchDashboard()
    } catch (error) {
      toast.error('Failed to delete material')
    }
  }

  const handleCreatePlan = async (e) => {
    e.preventDefault()
    try {
      await plansAPI.create({
        ...planForm,
        price: parseFloat(planForm.price),
        duration_days: parseInt(planForm.duration_days),
      })
      toast.success('Plan created successfully!')
      setPlanForm({
        name: '',
        description: '',
        price: '',
        duration_days: '30',
        material_ids: [],
      })
      fetchPlans()
      fetchDashboard()
    } catch (error) {
      toast.error('Failed to create plan')
    }
  }

  const resetNoticeForm = () => {
    setNoticeForm({
      title: '',
      message: '',
      notice_type: 'announcement',
      is_active: true,
    })
    setEditingNoticeId(null)
  }

  const handleSaveNotice = async (e) => {
    e.preventDefault()
    try {
      if (editingNoticeId) {
        await noticesAPI.update(editingNoticeId, noticeForm)
        toast.success('Notice updated successfully!')
      } else {
        await noticesAPI.create(noticeForm)
        toast.success('Notice published successfully!')
      }
      resetNoticeForm()
      fetchNotices()
    } catch (error) {
      toast.error('Failed to save notice')
    }
  }

  const handleEditNotice = (notice) => {
    setEditingNoticeId(notice.id)
    setNoticeForm({
      title: notice.title,
      message: notice.message,
      notice_type: notice.notice_type,
      is_active: notice.is_active,
    })
    setActiveTab('notices')
  }

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Delete this notice?')) return
    try {
      await noticesAPI.delete(id)
      toast.success('Notice deleted successfully!')
      fetchNotices()
      if (editingNoticeId === id) {
        resetNoticeForm()
      }
    } catch (error) {
      toast.error('Failed to delete notice')
    }
  }

  const resetTuitionInfoForm = () => {
    setTuitionInfoForm({
      title: '',
      description: '',
      info_type: 'class_info',
      is_active: true,
    })
    setEditingTuitionInfoId(null)
  }

  const handleSaveTuitionInfo = async (e) => {
    e.preventDefault()
    try {
      if (editingTuitionInfoId) {
        await tuitionInfoAPI.update(editingTuitionInfoId, tuitionInfoForm)
        toast.success('Tuition info updated successfully!')
      } else {
        await tuitionInfoAPI.create(tuitionInfoForm)
        toast.success('Tuition info published successfully!')
      }
      resetTuitionInfoForm()
      fetchTuitionInfo()
    } catch (error) {
      toast.error('Failed to save tuition info')
    }
  }

  const handleEditTuitionInfo = (info) => {
    setEditingTuitionInfoId(info.id)
    setTuitionInfoForm({
      title: info.title,
      description: info.description,
      info_type: info.info_type,
      is_active: info.is_active,
    })
    setActiveTab('tuition-info')
  }

  const handleDeleteTuitionInfo = async (id) => {
    if (!window.confirm('Delete this tuition info?')) return
    try {
      await tuitionInfoAPI.delete(id)
      toast.success('Tuition info deleted successfully!')
      fetchTuitionInfo()
      if (editingTuitionInfoId === id) {
        resetTuitionInfoForm()
      }
    } catch (error) {
      toast.error('Failed to delete tuition info')
    }
  }

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Delete this plan? This action cannot be undone.')) return
    try {
      await plansAPI.delete(id)
      toast.success('Plan deleted successfully!')
      fetchPlans()
      fetchDashboard()
    } catch (error) {
      toast.error('Failed to delete plan')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'users', name: 'Users', badge: users.filter((user) => user.is_active).length },
    { id: 'pending-orders', name: 'Pending Orders', badge: pendingOrders.length },
    { id: 'materials', name: 'Materials' },
    { id: 'plans', name: 'Plans' },
    { id: 'notices', name: 'Notice Board', badge: notices.filter((notice) => notice.is_active).length },
    { id: 'tuition-info', name: 'Tuition Info', badge: tuitionInfo.filter((info) => info.is_active).length },
    { id: 'upload-material', name: 'Upload Material' },
    { id: 'create-plan', name: 'Create Plan' },
  ]

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                {tab.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                {tab.badge > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'overview' && dashboard && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboard.total_users}</p>
                  </div>
                  <Users className="h-12 w-12 text-primary-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Materials</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboard.total_materials}</p>
                  </div>
                  <FileText className="h-12 w-12 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Plans</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboard.total_plans}</p>
                  </div>
                  <Package className="h-12 w-12 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₹{dashboard.total_revenue}</p>
                  </div>
                  <DollarSign className="h-12 w-12 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboard.recent_orders?.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{order.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">User Management</h2>
              <p className="text-sm text-gray-600 mt-1">Manage user accounts and access</p>
            </div>
            {users.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className={!user.is_active ? 'bg-gray-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleUserActive(user.id)}
                              className={`inline-flex items-center px-3 py-1 rounded ${
                                user.is_active
                                  ? 'bg-red-600 text-white hover:bg-red-700'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {user.is_active ? (
                                <>
                                  <UserX className="h-4 w-4 mr-1" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  Activate
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pending-orders' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Pending Orders - Awaiting Approval</h2>
              <p className="text-sm text-gray-600 mt-1">Review and approve orders after receiving payment</p>
            </div>
            {pendingOrders.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending orders</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="font-medium">{order.user?.full_name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">ID: {order.user_id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <a href={`tel:${order.user?.phone}`} className="text-blue-600 hover:text-blue-800 font-medium">
                            {order.user?.phone || 'N/A'}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.plan_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{order.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            onClick={() => handleApproveOrder(order.id)}
                            className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectOrder(order.id)}
                            className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">All Materials</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {materials.map((material) => (
                    <tr key={material.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{material.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          material.material_type === 'free' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {material.material_type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{material.category || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteMaterial(material.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">All Plans</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {plans.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Price:</strong> ₹{plan.price}</p>
                    <p><strong>Duration:</strong> {plan.duration_days === 0 ? 'Lifetime' : `${plan.duration_days} days`}</p>
                    <p><strong>Materials:</strong> {plan.materials?.length || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notices' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6 lg:col-span-1">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Bell className="h-6 w-6 mr-2" />
                {editingNoticeId ? 'Edit Notice' : 'Publish Notice'}
              </h2>
              <form onSubmit={handleSaveNotice} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={noticeForm.title}
                    onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                    className="input-field"
                    placeholder="e.g., New test series uploaded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={noticeForm.notice_type}
                    onChange={(e) => setNoticeForm({ ...noticeForm, notice_type: e.target.value })}
                    className="input-field"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="activity">Activity</option>
                    <option value="info">Info</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    required
                    value={noticeForm.message}
                    onChange={(e) => setNoticeForm({ ...noticeForm, message: e.target.value })}
                    className="input-field"
                    rows="5"
                    placeholder="Write the latest update for students"
                  />
                </div>

                <label className="flex items-center space-x-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={noticeForm.is_active}
                    onChange={(e) => setNoticeForm({ ...noticeForm, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <span>Show this notice on home page</span>
                </label>

                <div className="flex flex-wrap gap-3">
                  <button type="submit" className="btn-primary inline-flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {editingNoticeId ? 'Update Notice' : 'Publish Notice'}
                  </button>
                  {editingNoticeId && (
                    <button type="button" onClick={resetNoticeForm} className="btn-secondary">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow lg:col-span-2">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Notice Board Updates</h2>
                <p className="text-sm text-gray-600 mt-1">Active notices appear on the student home page.</p>
              </div>

              {notices.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No notices published yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notices.map((notice) => (
                    <div key={notice.id} className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{notice.title}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              notice.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {notice.is_active ? 'ACTIVE' : 'HIDDEN'}
                            </span>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700">
                              {notice.notice_type.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{notice.message}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEditNotice(notice)}
                            className="text-primary-600 hover:text-primary-800"
                            aria-label="Edit notice"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteNotice(notice.id)}
                            className="text-red-600 hover:text-red-900"
                            aria-label="Delete notice"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tuition-info' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6 lg:col-span-1">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Info className="h-6 w-6 mr-2" />
                {editingTuitionInfoId ? 'Edit Tuition Info' : 'Add Tuition Info'}
              </h2>
              <form onSubmit={handleSaveTuitionInfo} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={tuitionInfoForm.title}
                    onChange={(e) => setTuitionInfoForm({ ...tuitionInfoForm, title: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Classes 3rd to 12th"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={tuitionInfoForm.info_type}
                    onChange={(e) => setTuitionInfoForm({ ...tuitionInfoForm, info_type: e.target.value })}
                    className="input-field"
                  >
                    <option value="class_info">Class Info</option>
                    <option value="subjects">Subjects</option>
                    <option value="schedule">Schedule</option>
                    <option value="admission">Admission</option>
                    <option value="result">Result</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    required
                    value={tuitionInfoForm.description}
                    onChange={(e) => setTuitionInfoForm({ ...tuitionInfoForm, description: e.target.value })}
                    className="input-field"
                    rows="5"
                    placeholder="Write details about tuition classes, subjects, batch timing, admission, or results"
                  />
                </div>

                <label className="flex items-center space-x-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={tuitionInfoForm.is_active}
                    onChange={(e) => setTuitionInfoForm({ ...tuitionInfoForm, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <span>Show this info on home page</span>
                </label>

                <div className="flex flex-wrap gap-3">
                  <button type="submit" className="btn-primary inline-flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {editingTuitionInfoId ? 'Update Info' : 'Publish Info'}
                  </button>
                  {editingTuitionInfoId && (
                    <button type="button" onClick={resetTuitionInfoForm} className="btn-secondary">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow lg:col-span-2">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Tuition Class Info</h2>
                <p className="text-sm text-gray-600 mt-1">Active info appears near the top of the home page.</p>
              </div>

              {tuitionInfo.length === 0 ? (
                <div className="p-12 text-center">
                  <Info className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No tuition info added yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {tuitionInfo.map((info) => (
                    <div key={info.id} className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{info.title}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              info.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {info.is_active ? 'ACTIVE' : 'HIDDEN'}
                            </span>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                              {info.info_type.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{info.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEditTuitionInfo(info)}
                            className="text-primary-600 hover:text-primary-800"
                            aria-label="Edit tuition info"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTuitionInfo(info.id)}
                            className="text-red-600 hover:text-red-900"
                            aria-label="Delete tuition info"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'upload-material' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Upload className="h-6 w-6 mr-2" />
              Upload Material
            </h2>
            <form onSubmit={handleUploadMaterial} className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className="input-field"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={uploadForm.material_type}
                  onChange={(e) => setUploadForm({ ...uploadForm, material_type: e.target.value })}
                  className="input-field"
                >
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                  className="input-field"
                  placeholder="e.g., study_material, exam_paper"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                  className="input-field"
                />
              </div>

              <button type="submit" className="btn-primary">
                Upload Material
              </button>
            </form>
          </div>
        )}

        {activeTab === 'create-plan' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <PlusCircle className="h-6 w-6 mr-2" />
              Create Plan
            </h2>
            <form onSubmit={handleCreatePlan} className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name</label>
                <input
                  type="text"
                  required
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="input-field"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={planForm.price}
                  onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days, 0 for lifetime)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={planForm.duration_days}
                  onChange={(e) => setPlanForm({ ...planForm, duration_days: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Materials</label>
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                  {materials.map((material) => (
                    <label key={material.id} className="flex items-center space-x-2 py-2">
                      <input
                        type="checkbox"
                        checked={planForm.material_ids.includes(material.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPlanForm({
                              ...planForm,
                              material_ids: [...planForm.material_ids, material.id],
                            })
                          } else {
                            setPlanForm({
                              ...planForm,
                              material_ids: planForm.material_ids.filter((id) => id !== material.id),
                            })
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{material.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary">
                Create Plan
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
