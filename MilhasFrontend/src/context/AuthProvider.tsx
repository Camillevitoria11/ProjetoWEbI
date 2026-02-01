// src/context/AuthProvider.tsx
import { useState, type ReactNode } from 'react';
import type { LoginDTO, RegistroDTO, TokenDTO } from '../types/auth';
import { AuthContext } from './AuthContext';
import api from '../services/api';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        // Inicialização síncrona evita o erro de cascading render
        const token = localStorage.getItem('@App:token');
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return true;
        }
        return false;
    });

    const [loading] = useState<boolean>(false);

    async function login(dados: LoginDTO) {
        const response = await api.post<TokenDTO>('/auth/login', dados);
        const { token } = response.data;
        localStorage.setItem('@App:token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setIsAuthenticated(true);
    }

    async function registrar(dados: RegistroDTO) {
        await api.post('/auth/registrar', dados);
    }

    function logout() {
        localStorage.removeItem('@App:token');
        delete api.defaults.headers.common['Authorization'];
        setIsAuthenticated(false);
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, loading, login, registrar, logout }}>
            {children}
        </AuthContext.Provider>
    );
}