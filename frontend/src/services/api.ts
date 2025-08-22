import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем перехватчик для установки токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Добавляем перехватчик для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Аутентификация
export const auth = {
  login: async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post('/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
  register: async (username: string, password: string, role: string, company: string, fullName: string) => {
    const response = await api.post('/register', {
      email: username,
      password,
      role,
      company,
      full_name: fullName,
    });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};

// Оператор
export const operator = {
  // Маршруты
  getRoutes: async () => {
    const response = await api.get('/operator/routes/');
    return response.data;
  },
  createRoute: async (routeData: any) => {
    const response = await api.post('/operator/routes/', routeData);
    return response.data;
  },
  updateRoute: (id: number, data: any) => api.put(`/operator/routes/${id}`, data).then(res => res.data),
  deleteRoute: async (id: number) => {
    const response = await api.delete(`/operator/routes/${id}`);
    return response.data;
  },

  // Судна
  getShips: async () => {
    const response = await api.get('/operator/ships/');
    return response.data;
  },
  createShip: async (shipData: any) => {
    const response = await api.post('/operator/ships/', shipData);
    return response.data;
  },
  updateShip: async (id: number, shipData: any) => {
    const response = await api.put(`/operator/ships/${id}`, shipData);
    return response.data;
  },
  deleteShip: async (id: number) => {
    const response = await api.delete(`/operator/ships/${id}`);
    return response.data;
  },

  // Отчеты
  getReports: async () => {
    const response = await api.get('/reports');
    return response.data;
  },
  approveReport: async (id: number) => {
    const response = await api.post(`/reports/${id}/approve`);
    return response.data;
  },
  rejectReport: async (id: number) => {
    const response = await api.post(`/reports/${id}/reject`);
    return response.data;
  },

  getCaptains: async () => {
    const response = await api.get('/operator/captains/');
    return response.data;
  },
};

// Капитан
export const captain = {
  // Маршруты
  getRoutes: async () => {
    const response = await api.get('/captain/routes/');
    return response.data;
  },
  startRoute: (id: number) => api.post(`/captain/routes/${id}/start`).then(res => res.data),
  completeRoute: (id: number) => api.post(`/captain/routes/${id}/complete`).then(res => res.data),

  // Места лова
  getFishingSpots: async () => {
    const response = await api.get('/captain/fishing_spots/');
    return response.data;
  },
  createFishingSpot: async (spotData: any) => {
    const response = await api.post('/captain/fishing_spots/', spotData);
    return response.data;
  },
  updateFishingSpot: (id: number, data: any) => api.put(`/captain/fishing_spots/${id}`, data).then(res => res.data),
  deleteFishingSpot: async (id: number) => {
    const response = await api.delete(`/captain/fishing_spots/${id}`);
    return response.data;
  },
  updateFishingSpotTime: async (id: number, timeData: any) => {
    const response = await api.put(`/captain/fishing_spots/${id}/time/`, timeData);
    return response.data;
  },

  // Отчеты
  getReports: async () => {
    const response = await api.get('/reports');
    return response.data;
  },
  createReport: async (data: {
    fish_type: string;
    weight: number;
    location: string;
    notes?: string;
    route_id?: number | null;
  }) => {
    const response = await api.post('/reports', data);
    return response.data;
  },
  updateReport: (id: number, data: any) => api.put(`/captain/reports/${id}`, data).then(res => res.data),
  deleteReport: (id: number) => api.delete(`/captain/reports/${id}`).then(res => res.data),
  cancelReport: (id: number) => api.post(`/captain/reports/${id}/cancel`).then(res => res.data)
};