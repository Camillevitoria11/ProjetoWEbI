import { createContext, useState, ReactNode, useEffect } from 'react';
import { LoginDTO, RegistroDTO, TokenDTO } from '../types/auth';
import api from '../services/api';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (dados: LoginDTO) => Promise<void>;
    registrar: (dados: RegistroDTO) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) setIsAuthenticated(true);
    }, []);

    async function login(dados: LoginDTO) {
        try {
            // Chama o endpoint /auth/login do seu Java
            const response = await api.post<TokenDTO>('/auth/login', dados);
            
            const { token } = response.data;
            
            // Salva no navegador e atualiza estado
            localStorage.setItem('token', token);
            api.defaults.headers.Authorization = `Bearer ${token}`;
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Erro no login", error);
            throw error;
        }
    }

    async function registrar(dados: RegistroDTO) {
         // Chama o endpoint /auth/registrar do seu Java
        await api.post('/auth/registrar', dados);
    }

    function logout() {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, registrar, logout }}>
            {children}
        </AuthContext.Provider>
    );
}