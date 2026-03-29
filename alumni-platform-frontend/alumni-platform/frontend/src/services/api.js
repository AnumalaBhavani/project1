import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Attach JWT token to every request
API.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ---- Auth ----
export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  registerAlumni: (data) => API.post('/auth/register/alumni', data),
  registerStudent: (data) => API.post('/auth/register/student', data),
};

// ---- Alumni ----
export const alumniAPI = {
  directory: (params) => API.get('/alumni/directory', { params }),
  myProfile: () => API.get('/alumni/profile'),
  profileById: (id) => API.get(`/alumni/profile/${id}`),
  updateProfile: (data) => API.put('/alumni/profile', data),
  verifyProfile: () => API.post('/alumni/profile/verify'),
  toggleMentorship: (available) => API.patch('/alumni/profile/mentorship', null, { params: { available } }),
  parseResume: (file) => {
    const fd = new FormData(); fd.append('file', file);
    return API.post('/alumni/profile/parse-resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  contributions: () => API.get('/alumni/contributions'),
  notifications: () => API.get('/alumni/notifications'),
  markAllRead: () => API.post('/alumni/notifications/read-all'),
};

// ---- Jobs ----
export const jobAPI = {
  list: (params) => API.get('/jobs/public/list', { params }),
  postJob: (data) => API.post('/jobs/post', data),
  myJobs: () => API.get('/jobs/my-jobs'),
  apply: (jobId, file, coverLetter) => {
    const fd = new FormData();
    if (file) fd.append('resume', file);
    if (coverLetter) fd.append('coverLetter', coverLetter);
    return API.post(`/jobs/${jobId}/apply`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getApplications: (jobId) => API.get(`/jobs/${jobId}/applications`),
  myApplications: () => API.get('/jobs/my-applications'),
};

// ---- Mentorship ----
export const mentorshipAPI = {
  sendRequest: (alumniId, data) => API.post(`/mentorship/request/${alumniId}`, data),
  respond: (requestId, data) => API.patch(`/mentorship/request/${requestId}/respond`, data),
  alumniRequests: () => API.get('/mentorship/alumni/requests'),
  studentRequests: () => API.get('/mentorship/student/requests'),
};

// ---- Admin ----
export const adminAPI = {
  dashboard: () => API.get('/admin/dashboard'),
  pendingAlumni: () => API.get('/admin/alumni/pending'),
  approveAlumni: (userId) => API.patch(`/admin/alumni/${userId}/approve`),
  pendingJobs: () => API.get('/admin/jobs/pending'),
  moderateJob: (jobId, action) => API.patch(`/admin/jobs/${jobId}/moderate`, null, { params: { action } }),
  incompleteProfiles: (threshold) => API.get('/admin/alumni/incomplete-profiles', { params: { threshold } }),
  topContributors: () => API.get('/admin/contributors/top'),
  allAlumni: () => API.get('/admin/alumni/all'),
};

export default API;
