import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Sessions ───────────────────────────────────────────────
export const sessionsAPI = {
  start:  d => api.post('/sessions/start', d),
  end:    (id, d) => api.patch(`/sessions/${id}/end`, d),
  alert:  (id, d) => api.post(`/sessions/${id}/alert`, d),
  list:   p => api.get('/sessions', { params: p }),
  get:    id => api.get(`/sessions/${id}`),
  delete: id => api.delete(`/sessions/${id}`),
};

// ── Analytics ──────────────────────────────────────────────
export const analyticsAPI = {
  summary:  () => api.get('/analytics/summary'),
  objects:  () => api.get('/analytics/objects'),
  timeline: () => api.get('/analytics/timeline'),
  alerts:   () => api.get('/analytics/alerts'),
};

export default api;
