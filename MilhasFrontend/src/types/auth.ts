
export interface LoginDTO {
    email: string;
    senha: string;
}

export interface RegistroDTO {
    nome: string;
    email: string;
    senha: string;
}

export interface TokenDTO {
    token: string;
    tipo: string;
}