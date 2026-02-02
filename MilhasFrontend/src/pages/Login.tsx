import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import airplane from '../assets/airplane.png';
import type { AxiosError } from 'axios';

// Interface apenas para a resposta de login
interface LoginResponse {
    token: string;
    tipo: string;
    nome: string;
}

// Helper para verificar se é erro do Axios
const isAxiosError = (error: unknown): error is AxiosError => {
    return (
        typeof error === 'object' &&
        error !== null &&
        'isAxiosError' in error &&
        (error as AxiosError).isAxiosError === true
    );
};

// Helper para extrair mensagem de erro
const extractErrorMessage = (error: AxiosError): string => {
    const status = error.response?.status;
    const responseData = error.response?.data;
    
    let errorMessage = 'Erro na autenticação';
    
    // Extrai mensagem do response.data
    if (typeof responseData === 'object' && responseData !== null) {
        const data = responseData as Record<string, unknown>;
        if (typeof data.message === 'string') {
            errorMessage = data.message;
        } else if (typeof data.error === 'string') {
            errorMessage = data.error;
        }
    }
    
    // Mapeia códigos de status para mensagens amigáveis
    switch (status) {
        case 400:
            return errorMessage || 'Requisição inválida';
        case 401:
        case 403:
            return 'E-mail ou senha incorretos';
        case 404:
            return 'Endpoint não encontrado. Verifique a URL do servidor.';
        case 500:
            return 'Erro interno do servidor';
        default:
            return errorMessage;
    }
};

// Helper principal para tratar erros
const handleApiError = (error: unknown): string => {
    if (isAxiosError(error)) {
        return extractErrorMessage(error);
    } else if (error instanceof Error) {
        return error.message;
    } else if (typeof error === 'string') {
        return error;
    }
    return 'Ocorreu um erro desconhecido';
};

export function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    // Verificar se já está logado quando o componente monta
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            console.log('🔍 Usuário já autenticado, redirecionando para dashboard...');
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        
        if (!email || !senha) {
            setErrorMessage('Preencha e-mail e senha');
            return;
        }

        if (loading) return;
        setLoading(true);

        console.log('🔑 Tentando login com:', { email, senha: '***' });

        try {
            console.log('📤 Enviando requisição para /auth/login...');
            
            // FAZ A REQUISIÇÃO SEM O INTERCEPTOR (para evitar problemas com token)
            const response = await api.post<LoginResponse>('/auth/login', {
                email,
                senha
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Resposta do servidor:', response.data);

            if (response.data?.token) {
                // 1. Limpa dados antigos
                localStorage.clear();

                // 2. Salva o token
                const token = response.data.token;
                localStorage.setItem('token', token);
                localStorage.setItem('@App:token', token);
                console.log('💾 Token salvo no localStorage:', token.substring(0, 20) + '...');
                
                // 3. Salva o nome do usuário
                if (response.data.nome) {
                    localStorage.setItem('userName', response.data.nome);
                    console.log('👤 Nome salvo:', response.data.nome);
                }
                
                // 4. Salva o tipo de usuário (se existir)
                if (response.data.tipo) {
                    localStorage.setItem('userType', response.data.tipo);
                    console.log('🏷️ Tipo salvo:', response.data.tipo);
                }

                // 5. Verifica imediatamente se foi salvo
                const tokenVerificado = localStorage.getItem('token');
                if (!tokenVerificado) {
                    console.error('❌ Token NÃO foi salvo no localStorage!');
                    setErrorMessage('Erro ao salvar sessão');
                    setLoading(false);
                    return;
                }

                console.log('✅ Token verificado no localStorage');

                // 6. Dá um pequeno delay para garantir que tudo foi salvo
                setTimeout(() => {
                    console.log('🚀 Redirecionando para dashboard...');
                    // Força o redirecionamento com window.location se navigate não funcionar
                    window.location.href = '/dashboard';
                }, 100);
            
            } else {
                console.error('❌ Resposta do servidor sem token:', response.data);
                setErrorMessage('Resposta do servidor inválida');
                setLoading(false);
            }

        } catch (error: unknown) {
            console.error('❌ Erro no login:', error);
            
            const errorMsg = handleApiError(error);
            setErrorMessage(errorMsg);
            
            if (isAxiosError(error)) {
                console.error('📡 Status:', error.response?.status);
                console.error('📡 Dados:', error.response?.data);
            }
            
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-5xl bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">

                {/* Lado Esquerdo: Marca */}
                <div className="hidden md:flex flex-col justify-center items-center bg-slate-950 p-12 border-r border-slate-800">
                    <h1 className="text-5xl mb-6 tracking-tight text-indigo-500 font-bold">
                        MultiMilhas
                    </h1>
                    <img
                        src={airplane}
                        alt="Avião"
                        className="w-full max-w-sm rounded-2xl shadow-2xl opacity-80 transition-transform duration-700 hover:scale-105"
                    />
                    <p className="mt-8 text-slate-500 text-xs uppercase tracking-[0.3em] font-medium">
                        A inteligência por trás das milhas
                    </p>
                </div>

                {/* Lado Direito: Formulário */}
                <div className="flex flex-col justify-center p-8 md:p-16 bg-slate-950">
                    <div className="w-full max-w-md mx-auto">
                        <header className="mb-10 text-center md:text-left">
                            <h2 className="text-3xl font-bold mb-2 text-white">Acesse sua conta</h2>
                            <p className="text-slate-500 text-sm">Bem-vindo(a) de volta!</p>
                        </header>

                        {errorMessage && (
                            <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-xl">
                                <p className="text-red-300 text-sm">{errorMessage}</p>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                                    E-mail
                                </label>
                                <input
                                    type="email"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:border-indigo-500 outline-none transition-all"
                                    placeholder="exemplo@email.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                                    Senha
                                </label>
                                <input
                                    type="password"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Sua senha"
                                    value={senha}
                                    onChange={e => setSenha(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full p-4 rounded-xl font-bold text-white transition-all ${
                                    loading 
                                        ? 'bg-slate-800 border border-slate-700 cursor-not-allowed' 
                                        : 'bg-indigo-700 border border-indigo-600 hover:bg-indigo-600 cursor-pointer'
                                }`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verificando...
                                    </span>
                                ) : 'Entrar'}
                            </button>
                        </form>

                        <footer className="mt-10 text-center">
                            <p className="text-slate-500 text-sm">
                                Não possui conta?
                                <Link
                                    to="/registrar"
                                    className="text-indigo-400 hover:text-indigo-300 ml-2 font-semibold"
                                >
                                    Cadastre-se aqui
                                </Link>
                            </p>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}