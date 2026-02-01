import { AxiosError } from 'axios';

export interface ApiErrorResponse {
    message?: string;
    error?: string;
    status?: number;
    timestamp?: string;
}

export function handleApiError(error: unknown): string {
    if (error instanceof AxiosError) {
        const data = error.response?.data as ApiErrorResponse | undefined;
        
        if (data?.message) {
            return data.message;
        }
        
        if (error.response?.status === 401) {
            return 'Sessão expirada. Faça login novamente.';
        }
        
        if (error.response?.status === 403) {
            return 'Acesso não autorizado.';
        }
        
        if (error.response?.status === 404) {
            return 'Recurso não encontrado.';
        }
        
        if (error.response?.status === 409) {
            return 'Conflito - este recurso já existe.';
        }
        
        return `Erro ${error.response?.status || 'desconhecido'}`;
    }
    
    if (error instanceof Error) {
        return error.message;
    }
    
    return 'Erro desconhecido';
}