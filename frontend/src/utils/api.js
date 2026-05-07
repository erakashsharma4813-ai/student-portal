import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth APIs
export const authAPI = {
  getOTPConfig: () => api.get('/auth/otp-config'),
  sendOTP: (phone) => api.post('/auth/send-otp', { phone }),
  verifyOTP: (phone, otp) => api.post('/auth/verify-otp', { phone, otp }),
  register: (data) => api.post('/auth/register', data),
  login: (formData) => api.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }),
  getMe: () => api.get('/auth/me'),
}

// Materials APIs
export const materialsAPI = {
  getAll: () => api.get('/materials/'),
  getFree: () => api.get('/materials/free'),
  getById: (id) => api.get(`/materials/${id}`),
  download: (id) => api.get(`/materials/${id}/download`, { responseType: 'blob' }),
  upload: (formData) => api.post('/materials/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/materials/${id}`),
}

// Notices APIs
export const noticesAPI = {
  getPublic: () => api.get('/notices/'),
  getAdmin: () => api.get('/notices/admin'),
  create: (data) => api.post('/notices/', data),
  update: (id, data) => api.put(`/notices/${id}`, data),
  delete: (id) => api.delete(`/notices/${id}`),
}

// Tuition Info APIs
export const tuitionInfoAPI = {
  getPublic: () => api.get('/tuition-info/'),
  getAdmin: () => api.get('/tuition-info/admin'),
  create: (data) => api.post('/tuition-info/', data),
  update: (id, data) => api.put(`/tuition-info/${id}`, data),
  delete: (id) => api.delete(`/tuition-info/${id}`),
}

// Plans APIs
export const plansAPI = {
  getAll: () => api.get('/plans/'),
  getById: (id) => api.get(`/plans/${id}`),
  create: (data) => api.post('/plans/', data),
  update: (id, data) => api.put(`/plans/${id}`, data),
  delete: (id) => api.delete(`/plans/${id}`),
}

// Orders APIs
export const ordersAPI = {
  create: (data) => api.post('/orders/create', data),
  approve: (id) => api.post(`/orders/${id}/approve`),
  reject: (id) => api.post(`/orders/${id}/reject`),
  getMyOrders: () => api.get('/orders/my-orders'),
  getAllOrders: () => api.get('/orders/'),
  getPendingOrders: () => api.get('/orders/pending'),
  getMyPurchases: () => api.get('/orders/my-purchases'),
}

// Dashboard APIs
export const dashboardAPI = {
  getAdminDashboard: () => api.get('/dashboard/admin'),
  getStudentDashboard: () => api.get('/dashboard/student'),
}

// Users APIs
export const usersAPI = {
  getAll: () => api.get('/users/'),
  toggleActive: (id) => api.post(`/users/${id}/toggle-active`),
}

export default api
