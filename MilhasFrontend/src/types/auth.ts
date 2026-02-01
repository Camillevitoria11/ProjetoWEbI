// src/types/auth.ts

export interface LoginDTO {
    email: string;
    password?: string; // opcional se estiver usando apenas para tipos básicos
}

export interface RegistroDTO {
    nome: string;
    email: string;
    password?: string;
}

export interface TokenDTO {
    token: string;
}

// Definição que estava faltando:
export interface AuthContextType {
    isAuthenticated: boolean;
    loading: boolean;
    login: (dados: LoginDTO) => Promise<void>;
    registrar: (dados: RegistroDTO) => Promise<void>;
    logout: () => void;
}