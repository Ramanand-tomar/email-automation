import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
});

// Auto-inject x-google-id header from localStorage
api.interceptors.request.use((config) => {
  const googleId = localStorage.getItem('googleId');
  if (googleId) {
    config.headers['x-google-id'] = googleId;
  }
  return config;
});

// Auth
export const getAuthUrl = (returnUrl, syncPeriod = '30', inboxCategories = 'primary') =>
  api.get('/api/gmail/auth', { params: { returnUrl, syncPeriod, inboxCategories } });

export const getAuthStatus = (googleId) =>
  api.get('/api/gmail/status', { params: { googleId } });

// Emails
export const getEmails = (folder = 'inbox', page = 1, maxResults = 25) =>
  api.get('/api/gmail/emails', { params: { folder, page, maxResults } });

export const getEmailById = (id) =>
  api.get(`/api/gmail/emails/${id}`);

export const getThreadById = (id) =>
  api.get(`/api/gmail/threads/${id}`);

export const sendEmail = (payload) =>
  api.post('/api/gmail/send', payload);

export const replyToEmail = (id, payload) =>
  api.post(`/api/gmail/emails/${id}/reply`, payload);

export const modifyEmail = (id, action) =>
  api.post(`/api/gmail/modify/${id}`, { action });

export const deleteEmail = (id) =>
  api.delete(`/api/gmail/emails/${id}`);

export const syncEmails = () =>
  api.post('/api/gmail/sync');

// AI
export const generateAIReply = (emailContext, tone) =>
  api.post('/api/ai/generate-reply', { emailContext, tone });

export default api;
