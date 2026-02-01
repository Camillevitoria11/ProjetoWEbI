import { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import axios from 'axios';

import api from '../services/api';

import airplane from '../assets/airplane.png';



// Interface exata baseada na resposta do seu servidor

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

       

        if (loading) return;

        setLoading(true);



        try {

            // Chamada ao endpoint do Spring Boot

            const response = await api.post<LoginResponse>('/auth/login', {

                email,

                senha

            });

           

            // Verificamos se o token existe na resposta

            if (response.data && response.data.token) {

                // 1. Limpamos dados antigos para evitar conflitos de sessão

                localStorage.clear();



                // 2. Salvamos com a chave '@App:token' (deve ser igual no App.tsx e api.ts)

                localStorage.setItem('@App:token', response.data.token);

               

                // 3. Salvamos o nome vindo do banco (ex: Geizielle)

                localStorage.setItem('userName', response.data.nome);

               

                console.log("Login autorizado para:", response.data.nome);

               

                // 4. Redirecionamento forçado para a Dashboard

                // Usamos replace: true para que o usuário não volte ao login ao clicar em "voltar"

                navigate('/dashboard', { replace: true });

               

                // Opcional: Recarregar a página para garantir que o App.tsx leia o novo localStorage

                // window.location.reload();

            } else {

                throw new Error("Resposta do servidor inválida.");

            }



        } catch (error: unknown) {

            console.error("Falha na autenticação:", error);

           

            if (axios.isAxiosError(error)) {

                // Se o erro for 403 ou 401, a mensagem virá do Spring Security

                const mensagem = error.response?.data?.message || "E-mail ou senha incorretos.";

                alert(mensagem);

            } else {

                alert("Erro ao conectar com o servidor.");

            }

        } finally {

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



                        <form onSubmit={handleLogin} className="space-y-5">

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

                                    placeholder="Sua senha"

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

                                {loading ? "Verificando..." : "Entrar"}

                            </button>

                        </form>



                        <footer className="mt-10 text-center">

                            <p className="text-slate-500 text-sm">

                                Não possui conta?

                                <Link to="/registrar" className="text-indigo-400 hover:text-indigo-300 ml-2 font-semibold">

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