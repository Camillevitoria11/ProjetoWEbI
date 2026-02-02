// src/services/api.ts
import axios from 'axios';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interface para headers com Authorization
interface AuthHeaders {
    Authorization?: string;
    [key: string]: string | undefined;
}
// Interceptor para adicionar token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            (config.headers as AuthHeaders).Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Interceptor para tratar erros
api.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log(`✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
        return response;
    },
    (error: AxiosError) => {
        const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
        const url = error.config?.url || 'unknown-url';
        const status = error.response?.status || 'No response';
        
        console.error(`❌ ${status} ${method} ${url}:`, error.message);
        
        if (error.response?.status === 401) {
            console.log('🔒 Sessão expirada, limpando localStorage...');
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            localStorage.removeItem('userType');
            
            // Redirecionar para login se estiver em uma página protegida
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;