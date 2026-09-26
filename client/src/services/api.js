import axios from 'axios';

// Centralized API Base URL configuration
const RAW_API_URL = import.meta.env.VITE_API_URL || '';
const BASE_URL = RAW_API_URL ? `${RAW_API_URL.replace(/\/$/, '')}/api` : '/api';

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject stored JWT token into every outgoing request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle global response errors (e.g. 401 unauth, connection failures)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    }
    // Handle Network / Connection Errors gracefully
    if (!error.response && error.message === 'Network Error') {
      error.customMessage = 'Unable to connect to the Shift Management server. Please ensure the backend is running on port 5000.';
    }
    return Promise.reject(error);
  }
);

// API Service Helpers
export const busAPI = {
  getAll: () => API.get('/buses'),
  create: (data) => API.post('/buses', data),
  update: (id, data) => API.put(`/buses/${id}`, data),
  delete: (id) => API.delete(`/buses/${id}`)
};

export const driverAPI = {
  getAll: () => API.get('/drivers'),
  create: (data) => API.post('/drivers', data),
  getAvailableForShift: (shiftId) => API.get(`/drivers/available-for-shift/${shiftId}`)
};

export const conductorAPI = {
  getAll: () => API.get('/conductors'),
  create: (data) => API.post('/conductors', data),
  getAvailableForShift: (shiftId) => API.get(`/conductors/available-for-shift/${shiftId}`)
};

export const routeAPI = {
  getAll: () => API.get('/routes'),
  create: (data) => API.post('/routes', data)
};

export const shiftAPI = {
  getAll: () => API.get('/shifts'),
  create: (data) => API.post('/shifts', data),
  getAffectedByLeave: (leaveId) => API.get(`/shifts/affected-by-leave/${leaveId}`),
  updateStatus: (id, status) => API.put(`/shifts/${id}/status`, { status }),
  delete: (id) => API.delete(`/shifts/${id}`)
};

export const smartAssignAPI = {
  getRecommendations: (shiftDate, startTime, endTime) =>
    API.get('/shifts/smart-recommendations', { params: { shiftDate, startTime, endTime } })
};

export const attendanceAPI = {
  getAll: () => API.get('/attendance'),
  mark: (data) => API.post('/attendance', data)
};

export const leaveAPI = {
  getAll: () => API.get('/leaves'),
  getMy: () => API.get('/leaves/my'),
  getAllManager: () => API.get('/leaves/all'),
  getPending: () => API.get('/leaves/pending'),
  getById: (id) => API.get(`/leaves/${id}`),
  submit: (data) => API.post('/leaves', data),
  approve: (id, data) => API.put(`/leaves/${id}/approve`, data),
  approveWithReassignments: (id, data) => API.put(`/leaves/${id}/approve`, data),
  reject: (id, data) => API.put(`/leaves/${id}/reject`, data),
  review: (id, data) => API.put(`/leaves/${id}/review`, data)
};

export const swapAPI = {
  getAll: () => API.get('/swaps'),
  request: (data) => API.post('/swaps', data),
  peerReview: (id, status) => API.put(`/swaps/${id}/peer-review`, { status }),
  managerReview: (id, data) => API.put(`/swaps/${id}/manager-review`, data),
  adminReview: (id, data) => API.put(`/swaps/${id}/manager-review`, data)
};

export const employeeAPI = {
  getAll: (params) => API.get('/employees', { params }),
  getById: (id) => API.get(`/employees/${id}`),
  create: (data) => API.post('/employees', data),
  update: (id, data) => API.put(`/employees/${id}`, data),
  delete: (id) => API.delete(`/employees/${id}`)
};

export const dutyAPI = {
  getAll: (params) => API.get('/duties', { params }),
  getToday: () => API.get('/duties/today'),
  getById: (id) => API.get(`/duties/${id}`),
  create: (data) => API.post('/duties', data),
  update: (id, data) => API.put(`/duties/${id}`, data)
};

export const replacementAPI = {
  getCandidates: (dutyId) => API.get(`/replacements/candidates/${dutyId}`),
  assign: (data) => API.post('/replacements/assign', data),
  getHistory: () => API.get('/replacements/history')
};

export const permissionAPI = {
  getAll: () => API.get('/permissions'),
  apply: (data) => API.post('/permissions', data),
  review: (id, data) => API.put(`/permissions/${id}/review`, data)
};

export const reportAPI = {
  getSummary: () => API.get('/reports/summary'),
  getCrewRoster: () => API.get('/reports/crew-roster')
};

export const maintenanceAPI = {
  getAll: () => API.get('/maintenance'),
  create: (data) => API.post('/maintenance', data),
  updateStatus: (id, status) => API.put(`/maintenance/${id}/status`, { status })
};

export const issueAPI = {
  getAll: () => API.get('/issues'),
  report: (data) => API.post('/issues', data),
  updateStatus: (id, status) => API.put(`/issues/${id}/status`, { status })
};

export const notificationAPI = {
  getAll: () => API.get('/notifications'),
  create: (data) => API.post('/notifications', data)
};

export const analyticsAPI = {
  getSummary: () => API.get('/analytics/summary')
};

export default API;
