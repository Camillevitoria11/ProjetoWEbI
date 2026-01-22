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

    // Tipagem correta para evitar erros de 'unknown'
    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
        await api.post('/auth/registrar', { 
        nome, 
        email, 
        senha 
        });

        alert("Conta criada com sucesso! Agora faça seu login.");
        navigate('/login'); 
        }
        catch (error: unknown) { // Mudamos para 'unknown'
        console.error("Erro no cadastro:", error);
    
        // Verificamos se o erro é do Axios para acessar as propriedades com segurança
        if (axios.isAxiosError(error)) {
        const mensagem = error.response?.data?.message || "Erro ao criar conta. Tente novamente.";
        alert(mensagem);
        } else {
        // Erro genérico (ex: erro de rede ou erro de código)
        alert("Ocorreu um erro inesperado.");
        }
    } finally {
    setLoading(false);
}
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-5xl bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                
                {/* Lado Esquerdo: Marca */}
                <div className="hidden md:flex flex-col justify-center items-center bg-black p-12 border-r border-slate-800">
                    {/* Alterado de font-prosto para font-bold para evitar erro */}
                    <h1 className="text-5xl mb-6 tracking-tight text-indigo-500 font-bold">
                        MultiMilhas
                    </h1>
                    <img 
                        src={airplane} 
                        alt="Avião" 
                        className="w-full max-w-sm rounded-2xl shadow-2xl opacity-90 transition-all hover:scale-105 duration-500"
                    />
                    <p className="mt-6 text-slate-400 text-sm text-center uppercase tracking-widest">
                        Comece a transformar compras em viagens
                    </p>
                </div>

                {/* Lado Direito: Formulário */}
                <div className="flex flex-col justify-center p-8 md:p-12 bg-slate-950">
                    <div className="w-full">
                        <div className="mb-10">
                            <h2 className="text-3xl font-bold mb-2">Crie sua conta</h2>
                            <p className="text-slate-400">Preencha os dados abaixo para começar.</p>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Nome Completo</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="Ex: Geizielle Silva"
                                    value={nome}
                                    onChange={e => setNome(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">E-mail</label>
                                <input 
                                    type="email" 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="nome@email.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Senha</label>
                                <input 
                                    type="password" 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="No mínimo 6 caracteres"
                                    value={senha}
                                    onChange={e => setSenha(e.target.value)}
                                    required
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg flex justify-center items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? "Criando conta..." : "Cadastrar"}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-slate-500 text-sm">
                            Já possui uma conta? 
                            <Link to="/login" className="text-indigo-400 hover:underline ml-1 font-medium">Entrar agora</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}