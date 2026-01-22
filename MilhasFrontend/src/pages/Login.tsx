import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api';
import airplane from '../assets/airplane.png';

// 1. Interface atualizada exatamente como o seu console mostrou
interface LoginResponse {
    token: string;
    tipo: string;
    nome: string;
}

export function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Evita cliques duplos enquanto carrega
        if (loading) return;

        setLoading(true);

        try {
            const response = await api.post<LoginResponse>('/auth/login', { 
                email, 
                senha 
            });
            
            if (response.data && response.data.token) {
                // Limpa resquícios antigos antes de salvar os novos
                localStorage.clear();

                // Salva exatamente o que o interceptor e a Dashboard precisam
                localStorage.setItem('@App:token', response.data.token);
                localStorage.setItem('userName', response.data.nome);
                
                console.log("Sucesso! Nome salvo:", response.data.nome);
                
                // Força o redirecionamento
                navigate('/dashboard', { replace: true });
            }
         else {
                throw new Error("Token não encontrado na resposta do servidor.");
            }

        } catch (error: unknown) {
            console.error("Erro completo do login:", error);
            
            if (axios.isAxiosError(error)) {
                // Captura erro 401 (Credenciais inválidas) ou outros erros do servidor
                const mensagem = error.response?.data?.message || "E-mail ou senha incorretos.";
                alert(mensagem);
            } else {
                alert("Ocorreu um erro inesperado ao tentar logar.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-5xl bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                
                {/* Lado Esquerdo: Identidade Visual */}
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
                        A inteligência por trás dos seus pontos
                    </p>
                </div>

                {/* Lado Direito: Formulário de Entrada */}
                <div className="flex flex-col justify-center p-8 md:p-16 bg-slate-950">
                    <div className="w-full max-w-md mx-auto">
                        <header className="mb-10 text-center md:text-left">
                            <h2 className="text-3xl font-bold mb-2">Login</h2>
                            <p className="text-slate-500 text-sm">Acesse sua conta para gerenciar seu acúmulo.</p>
                        </header>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">E-mail</label>
                                <input 
                                    type="email" 
                                    autoComplete="email"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-700"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Senha</label>
                                <input 
                                    type="password" 
                                    autoComplete="current-password"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-700"
                                    placeholder="••••••••"
                                    value={senha}
                                    onChange={e => setSenha(e.target.value)}
                                    required
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Autenticando...
                                    </span>
                                ) : "Acessar Dashboard"}
                            </button>
                        </form>

                        <footer className="mt-10 text-center">
                            <p className="text-slate-500 text-sm">
                                Não tem uma conta? 
                                <Link to="/registrar" className="text-indigo-400 hover:text-indigo-300 ml-2 font-semibold">
                                    Cadastre-se grátis
                                </Link>
                            </p>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}