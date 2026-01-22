import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Wallet, Plus, Plane, LogOut, FileText, BarChart3, Loader2 } from 'lucide-react';
import api from '../services/api';
import axios from 'axios';

// Interface ajustada para bater exatamente com o seu CompraSaidaDTO do Java
interface Compra {
    id: number;
    descricao: string;
    valor: number;
    pontosCalculados: number;
    statusCredito: 'PENDENTE' | 'CREDITADO';
    dataCompra: string;
    nomeCartao: string;
    comprovanteUrl?: string;
}

export function Dashboard() {
    const navigate = useNavigate();
    const [compras, setCompras] = useState<Compra[]>([]);
    const [loading, setLoading] = useState(true);

    // Recuperação segura do nome do usuário
    const userName = localStorage.getItem('userName') || 'Usuário';

    // 1. handleLogout com useCallback: Resolve o erro "missing dependency" do ESLint
    const handleLogout = useCallback(() => {
        localStorage.clear();
        navigate('/login');
    }, [navigate]);

    // 2. Busca de dados centralizada
    const fetchDados = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/compras');
            // Garante que o estado sempre receba um array para evitar erro no .map()
            setCompras(Array.isArray(response.data) ? response.data : []);
        } catch (error: unknown) {
            console.error("Erro ao carregar dados", error);
            
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    handleLogout();
                }
            }
        } finally {
            setLoading(false);
        }
    }, [handleLogout]);

    useEffect(() => {
        fetchDados();
    }, [fetchDados]);

    // 3. Cálculos de Saldo (Baseados no status vindo do CompraSaidaDTO)
    const totalPontosDisponiveis = compras
        .filter(c => c.statusCredito === 'CREDITADO')
        .reduce((acc, curr) => acc + (curr.pontosCalculados || 0), 0);

    const totalPontosPendentes = compras
        .filter(c => c.statusCredito === 'PENDENTE')
        .reduce((acc, curr) => acc + (curr.pontosCalculados || 0), 0);

    return (
        <div className="min-h-screen bg-slate-950 text-white flex font-sans">
            {/* Sidebar Lateral */}
            <aside className="w-64 border-r border-slate-800 p-6 hidden md:flex flex-col">
                <h1 className="text-2xl font-bold text-indigo-500 mb-10 tracking-tight">
                    MultiMilhas
                </h1>
                
                <nav className="space-y-4 flex-1">
                    <button className="flex items-center gap-3 text-indigo-400 bg-indigo-500/10 w-full p-3 rounded-xl font-medium">
                        <BarChart3 size={20} /> Visão Geral
                    </button>
                    <button className="flex items-center gap-3 text-slate-400 hover:text-white w-full p-3 transition-colors">
                        <Plane size={20} /> Programas
                    </button>
                    <button className="flex items-center gap-3 text-slate-400 hover:text-white w-full p-3 transition-colors">
                        <Wallet size={20} /> Meus Cartões
                    </button>
                </nav>

                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-red-400 p-3 mt-auto hover:bg-red-500/10 rounded-xl transition-all group"
                >
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" /> 
                    Sair
                </button>
            </aside>

            {/* Conteúdo Principal */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl font-bold">
                            Olá, <span className="text-indigo-500">{userName}</span>
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Gerencie seu acúmulo de milhas.</p>
                    </div>
                    
                    <button 
                        onClick={() => navigate('/registrar-compra')}
                        className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                    >
                        <Plus size={20} /> Registrar Compra
                    </button>
                </header>

                {/* Cards de Saldo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl border-l-4 border-l-green-500 shadow-xl">
                        <p className="text-slate-500 text-sm mb-1 uppercase font-semibold">Saldo Disponível</p>
                        <h3 className="text-4xl font-bold">
                            {totalPontosDisponiveis.toLocaleString('pt-BR')}
                        </h3>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl border-l-4 border-l-yellow-500 shadow-xl">
                        <p className="text-slate-500 text-sm mb-1 uppercase font-semibold">Previsão de Crédito</p>
                        <h3 className="text-4xl font-bold text-slate-300">
                            {totalPontosPendentes.toLocaleString('pt-BR')}
                        </h3>
                    </div>
                </div>

                {/* Tabela de Compras Reais */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-950/50 text-slate-500 text-sm uppercase">
                                <tr>
                                    <th className="p-4 font-semibold">Descrição / Cartão</th>
                                    <th className="p-4 font-semibold text-indigo-400">Pontos</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold text-center">Comprovante</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="p-10 text-center">
                                            <Loader2 className="mx-auto animate-spin text-indigo-500" />
                                        </td>
                                    </tr>
                                ) : compras.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-10 text-center text-slate-500">
                                            Nenhuma compra encontrada no seu histórico.
                                        </td>
                                    </tr>
                                ) : (
                                    compras.map((compra) => (
                                        <tr key={compra.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div className="font-medium">{compra.descricao}</div>
                                                <div className="text-xs text-slate-500">{compra.nomeCartao}</div>
                                            </td>
                                            <td className="p-4 font-bold text-lg">
                                                +{compra.pontosCalculados.toLocaleString('pt-BR')}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                                                    compra.statusCredito === 'CREDITADO' 
                                                        ? 'bg-green-500/10 text-green-400' 
                                                        : 'bg-yellow-500/10 text-yellow-400'
                                                }`}>
                                                    {compra.statusCredito}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                {compra.comprovanteUrl && (
                                                    <a 
                                                        href={`http://localhost:8080/${compra.comprovanteUrl}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="text-slate-500 hover:text-indigo-400 transition-colors inline-block"
                                                    >
                                                        <FileText size={20} />
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}