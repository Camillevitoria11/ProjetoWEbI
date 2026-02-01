import { useState } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import airplane from '../assets/airplane.png';
import axios from 'axios';

export function Registro() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);

        try {
            await api.post('/auth/registrar', {
                nome,
                email,
                senha
            });

            alert("Conta criada com sucesso! Agora faça seu login.");
            navigate('/login');
        } catch (error: unknown) {
            console.error("Erro no cadastro:", error);
            if (axios.isAxiosError(error)) {
                const mensagem = error.response?.data?.message || "Erro ao criar conta. Tente novamente.";
                alert(mensagem);
            } else {
                alert("Ocorreu um erro inesperado.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-5xl bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                
                {/* Lado Esquerdo: Marca (Igual ao Login) */}
                <div className="hidden md:flex flex-col justify-center items-center bg-slate-950 p-12 border-r border-slate-800">
                    <h1 className="text-5xl mb-6 tracking-tight text-indigo-500 font-bold">
                        MultiMilhas
                    </h1>
                    <img
                        src={airplane} 
                        alt="Avião" 
                        className="w-full max-w-sm rounded-2xl shadow-2xl opacity-80 transition-transform duration-700 hover:scale-105"
                    />
                    {/* Slogan unificado conforme combinamos */}
                    <p className="mt-8 text-slate-500 text-xs uppercase tracking-[0.3em] font-medium text-center">
                        A inteligência por trás das milhas
                    </p>
                </div>

                {/* Lado Direito: Formulário (Adaptado com as cores do Login) */}
                <div className="flex flex-col justify-center p-8 md:p-16 bg-slate-950">
                    <div className="w-full max-w-md mx-auto">
                        <header className="mb-10 text-center md:text-left">
                            <h2 className="text-3xl font-bold mb-2 text-white">Crie sua conta</h2>
                            <p className="text-slate-500 text-sm">Comece a transformar compras em viagens.</p>
                        </header>

                        <form onSubmit={handleRegister} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Nome Completo</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Ex: Maria Silva"
                                    value={nome}
                                    onChange={e => setNome(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">E-mail</label>
                                <input
                                    type="email"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:border-indigo-500 outline-none transition-all"
                                    placeholder="exemplo@email.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Senha</label>
                                <input
                                    type="password"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:border-indigo-500 outline-none transition-all"
                                    placeholder="No mínimo 6 caracteres"
                                    value={senha}
                                    onChange={e => setSenha(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50"
                            >
                                {loading ? "Criando conta..." : "Cadastrar"}
                            </button>
                        </form>

                        <footer className="mt-10 text-center">
                            <p className="text-slate-500 text-sm">
                                Já possui uma conta?
                                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 ml-2 font-semibold">
                                    Entrar
                                </Link>
                            </p>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}