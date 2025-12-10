import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Habilitado para enviar cookies de sessão Django
});

// Interceptor para adicionar ID do usuário logado (do localStorage)
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user?.id) {
            config.headers['X-User-Id'] = user.id.toString();
          }
        } catch (e) {
          // Ignora erro de parse
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Sessão expirada ou sem permissão - redirecionar para login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const apiRoutes = {
  statistics: {
    dashboard: () => api.get('/api/prontuario/dashboard-stats/'),
    gestor: () => api.get('/api/prontuario/dashboard-stats/gestor/'),
    fisioterapeuta: () => api.get('/api/prontuario/dashboard-stats/fisioterapeuta/'),
  },
  auth: {
    login: (data: any) => api.post('/api/auth/login/', data),
    register: (data: any) => api.post('/api/auth/register/', data), // DESABILITADO no backend
    logout: () => api.post('/api/auth/logout/'),
    me: () => api.get('/api/auth/me/'),
    createLead: (data: any) => api.post('/api/auth/leads/', data), // NOVO - Captura de leads
    updateProfile: (data: any) => api.patch('/api/auth/profile/', data), // NOVO - Atualizar perfil
    changePassword: (data: any) => api.post('/api/auth/change-password/', data), // NOVO - Alterar senha
  },
  patients: {
    list: () => api.get('/api/prontuario/patients/'),
    get: (id: number) => api.get(`/api/prontuario/patients/${id}/`),
    create: (data: any) => api.post('/api/prontuario/patients/', data),
    update: (id: number, data: any) => api.patch(`/api/prontuario/patients/${id}/`, data),
    delete: (id: number) => api.delete(`/api/prontuario/patients/${id}/`),
    medicalRecords: (id: number) => api.get(`/api/prontuario/patients/${id}/medical_records/`),
    search: (query: string) => api.get(`/api/prontuario/patients/search/?q=${query}`),
    transfer: (id: number, data: { to_fisioterapeuta_id: number; reason?: string }) =>
      api.post(`/api/prontuario/patients/${id}/transfer/`, data),
    availableForTransfer: () => api.get('/api/prontuario/patients/available_for_transfer/'),
    transferHistory: (id: number) => api.get(`/api/prontuario/patients/${id}/transfer_history/`),
  },
  filiais: {
    list: () => api.get('/api/auth/filiais/'),
  },
  fisioterapeutas: {
    list: (filialId?: number) => api.get('/api/auth/fisioterapeutas/', {
      params: filialId ? { filial_id: filialId } : {}
    }),
    forTransfer: (patientId: number) => api.get('/api/auth/fisioterapeutas/transfer/', {
      params: { patient_id: patientId }
    }),
  },
  medicalRecords: {
    list: (params?: any) => api.get('/api/prontuario/medical-records/', { params }),
    get: (id: number) => api.get(`/api/prontuario/medical-records/${id}/`),
    create: (data: any) => api.post('/api/prontuario/medical-records/', data),
    update: (id: number, data: any) => api.patch(`/api/prontuario/medical-records/${id}/`, data),
    delete: (id: number) => api.delete(`/api/prontuario/medical-records/${id}/`),
    history: (id: number) => api.get(`/api/prontuario/medical-records/${id}/history/`),
  },
  documents: {
    list: (params?: any) => api.get('/api/documentos/documents/', { params }),
    get: (id: number) => api.get(`/api/documentos/documents/${id}/`),
    create: (data: FormData) => api.post('/api/documentos/documents/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    update: (id: number, data: any) => api.patch(`/api/documentos/documents/${id}/`, data),
    delete: (id: number) => api.delete(`/api/documentos/documents/${id}/`),
    download: (id: number) => api.get(`/api/documentos/documents/${id}/download/`, {
      responseType: 'blob',
    }),
    verify: (id: number) => api.post(`/api/documentos/documents/${id}/verify/`),
  },
  categories: {
    list: () => api.get('/api/documentos/categories/'),
    get: (id: number) => api.get(`/api/documentos/categories/${id}/`),
    create: (data: any) => api.post('/api/documentos/categories/', data),
    update: (id: number, data: any) => api.patch(`/api/documentos/categories/${id}/`, data),
    delete: (id: number) => api.delete(`/api/documentos/categories/${id}/`),
  },
};
