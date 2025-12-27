// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getAuthToken = () => localStorage.getItem('access_token');

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  
  if (response.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) return apiFetch(endpoint, options);
    window.location.href = '/auth/login';
    throw new Error('Unauthorized');
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'API request failed');
  }
  
  return response.json();
}

async function refreshToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return false;
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return true;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }
  return false;
}

export const authAPI = {
  login: async (username: string, password: string) => {
    const data = await apiFetch('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },
  
  signup: async (userData: any) => {
    const data = await apiFetch('/auth/signup/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => apiFetch('/auth/me/'),
};

export const equipmentAPI = {
  list: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch(`/equipment/${query}`);
  },
  get: (id: string) => apiFetch(`/equipment/${id}/`),
  create: (data: any) => apiFetch('/equipment/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiFetch(`/equipment/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/equipment/${id}/`, { method: 'DELETE' }),
  getTelemetry: (id: string) => apiFetch(`/equipment/${id}/telemetry/`),
};

export const ticketsAPI = {
  list: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch(`/tickets/${query}`);
  },
  get: (id: string) => apiFetch(`/tickets/${id}/`),
  create: (data: any) => apiFetch('/tickets/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiFetch(`/tickets/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  addMessage: (ticketId: string, content: string, type = 'text') =>
    apiFetch(`/tickets/${ticketId}/add_message/`, {
      method: 'POST',
      body: JSON.stringify({ content, type }),
    }),
};

export const teamsAPI = {
  list: () => apiFetch('/teams/'),
  get: (id: string) => apiFetch(`/teams/${id}/`),
  create: (data: any) => apiFetch('/teams/', { method: 'POST', body: JSON.stringify(data) }),
};

export const hierarchyAPI = {
  list: () => apiFetch('/hierarchy/'),
  getTree: () => apiFetch('/hierarchy/tree/'),
};

export const telemetryAPI = {
  list: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch(`/telemetry/${query}`);
  },
  log: (data: any) => apiFetch('/telemetry/', { method: 'POST', body: JSON.stringify(data) }),
};

export const usersAPI = {
  list: () => apiFetch('/users/'),
  get: (id: string) => apiFetch(`/users/${id}/`),
};
