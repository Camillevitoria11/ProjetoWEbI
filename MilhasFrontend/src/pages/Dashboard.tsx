import { useNavigate, Link } from 'react-router-dom'; // Adicionado Link aqui
import { useState, useEffect, useCallback } from 'react';
import {
    Wallet, Plus, Plane,LogOut, FileText, BarChart3, Loader2, AlertCircle, Gift
} from 'lucide-react';
import api from '../services/api';
import axios from 'axios';

// Interface mapeada conforme CompraSaidaDTO.java
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
    const [error, setError] = useState<string | null>(null);

    const userName = localStorage.getItem('userName') || 'Usuário';

    const handleLogout = useCallback(() => {
        localStorage.clear();
        navigate('/login');
    }, [navigate]);

    const fetchDados = useCallback(async () => {
        const token = localStorage.getItem('@App:token');
        if (!token) {
            handleLogout();
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            // Chamada ao endpoint do Java
            const response = await api.get('/compras/usuario');
            setCompras(Array.isArray(response.data) ? response.data : []);
        } catch (err: unknown) {
            console.error("Erro na Dashboard:", err);
            setError("Não foi possível carregar suas milhas.");
            
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    }, [handleLogout]);

    useEffect(() => {
        fetchDados();
    }, [fetchDados]);

    // Cálculos dinâmicos baseados no DTO
    const totalDisponivel = compras
        .filter(c => c.statusCredito === 'CREDITADO')
        .reduce((acc, curr) => acc + (curr.pontosCalculados || 0), 0);

    const totalPendente = compras
        .filter(c => c.statusCredito === 'PENDENTE')
        .reduce((acc, curr) => acc + (curr.pontosCalculados || 0), 0);

    return (
        <div className="min-h-screen bg-slate-950 text-white flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 p-6 hidden lg:flex flex-col bg-slate-950/50 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Plane size={18} className="text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">MultiMilhas</span>
                </div>
                
                <nav className="space-y-2 flex-1">
                    <button className="flex items-center gap-3 text-white bg-indigo-600/10 border border-indigo-500/20 w-full p-3 rounded-xl font-medium transition-all text-left">
                        <BarChart3 size={20} className="text-indigo-400" /> Visão Geral
                    </button>
                    
                    <Link
                        to="/meus-programas"
                        className="flex items-center gap-3 text-slate-400 hover:text-white hover:bg-white/5 w-full p-3 rounded-xl transition-all"
                    >
                        <Gift size={20} /> {/* Ícone de presente para programas */}
                        <span>Programas</span>
                    </Link>

                    {/* Botão Meus Cartões como Link */}
                    <Link
                        to="/cartoes"
                        className="flex items-center gap-3 text-slate-400 hover:text-white hover:bg-white/5 w-full p-3 rounded-xl transition-all"
                    >
                        <Wallet size={20} />
                        <span>Meus Cartões</span>
                    </Link>
                </nav>

                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-slate-500 hover:text-red-400 p-3 mt-auto rounded-xl transition-colors group text-left"
                >
                    <LogOut size={20} /> Sair da conta
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">
                            Olá, <span className="text-indigo-500">{userName}</span>
                        </h2>
                        <p className="text-slate-500 mt-1">Aqui está o resumo das suas milhas hoje.</p>
                    </div>
                    
                    <button
                        type="button"
                        onClick={() => navigate('/registrar-compra')}
                        className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                        <Plus size={20} /> Registrar Compra
                    </button>
                </header>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                        <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-2">Saldo Disponível</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-5xl font-black">{totalDisponivel.toLocaleString('pt-BR')}</h3>
                            <span className="text-green-500 font-medium text-sm">pontos</span>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                        <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-2">Aguardando Crédito</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-5xl font-black text-slate-300">{totalPendente.toLocaleString('pt-BR')}</h3>
                            <span className="text-amber-500 font-medium text-sm">pontos</span>
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <h4 className="font-bold text-lg">Últimas Atividades</h4>
                        {error && <span className="text-red-400 text-sm flex items-center gap-2"><AlertCircle size={14}/> {error}</span>}
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-800/50">
                                    <th className="px-6 py-4 font-bold">Descrição / Cartão</th>
                                    <th className="px-6 py-4 font-bold">Pontos</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 font-bold text-center">Comprovante</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="py-20 text-center">
                                            <Loader2 className="mx-auto animate-spin text-indigo-500" size={32} />
                                        </td>
                                    </tr>
                                ) : compras.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-20 text-center">
                                            <div className="w-12 h-12 mx-auto opacity-20 mb-4">
                                                <BarChart3 size={48} className="mx-auto" />
                                            </div>
                                            <p className="text-slate-500 font-medium">Nenhum registro encontrado.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    compras.map((compra) => (
                                        <tr key={compra.id} className="hover:bg-white/2 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="font-semibold text-slate-200">{compra.descricao}</div>
                                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                    <Wallet size={10} /> {compra.nomeCartao}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-lg font-bold text-indigo-400">
                                                    +{compra.pontosCalculados.toLocaleString('pt-BR')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider ${
                                                    compra.statusCredito === 'CREDITADO' 
                                                        ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                                                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                }`}>
                                                    {compra.statusCredito}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                {compra.comprovanteUrl ? (
                                                    <a 
                                                        href={`http://localhost:8080/uploads/${compra.comprovanteUrl}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="p-2 hover:bg-indigo-500/20 rounded-lg inline-block text-slate-400 hover:text-indigo-400 transition-all"
                                                        title="Ver Comprovante"
                                                    >
                                                        <FileText size={18} />
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-700">-</span>
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