// pages/MeusProgramas.tsx
import { useState, useEffect, useCallback } from 'react';
import { Gift, Plus, Trash2, Star, Wallet, Award, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface ProgramaDoUsuario {
    id: number;
    nome: string;
    saldoPontos: number;
}

interface ProgramaCatalogo {
    programaId: number;
    nome: string;
    descricao: string;
    multiplicadorBase: number;
}

interface ApiError {
    response?: {
        data: {
            message?: string;
            error?: string;
        };
        status: number;
    };
    message: string;
}

export function MeusProgramas() {
    const navigate = useNavigate();
    
    const [meusProgramas, setMeusProgramas] = useState<ProgramaDoUsuario[]>([]);
    const [catalogoProgramas, setCatalogoProgramas] = useState<ProgramaCatalogo[]>([]);
    const [loading, setLoading] = useState(true);
    const [adicionando, setAdicionando] = useState(false);
    const [removendo, setRemovendo] = useState<number | null>(null);
    const [programaSelecionado, setProgramaSelecionado] = useState<number | ''>('');
    const [erro, setErro] = useState<string>('');
    const [sucesso, setSucesso] = useState<string>('');

    // Carregar dados do backend - useCallback para evitar recriação
    const carregarDados = useCallback(async () => {
        setLoading(true);
        setErro('');
        
        try {
            // Carrega programas do usuário (GET /programas/usuario)
            const resProgramas = await api.get('/programas/usuario');
            
            // Carrega catálogo de programas (GET /programas/catalogo)
            const resCatalogo = await api.get('/programas/catalogo');
            
            setMeusProgramas(resProgramas.data);
            setCatalogoProgramas(resCatalogo.data);
            
        } catch (error: unknown) {
            const apiError = error as ApiError;
            
            if (apiError.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            
            if (apiError.response?.status === 404) {
                setErro('Endpoints do backend não encontrados. Verifique se o servidor está rodando.');
            } else {
                setErro('Erro ao carregar programas. Tente novamente.');
            }
            
            console.error("Erro ao carregar programas:", error);
        } finally {
            setLoading(false);
        }
    }, [navigate]); // Adicionado navigate como dependência

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        
        carregarDados();
    }, [carregarDados, navigate]); // Adicionado carregarDados como dependência

    // Associa um programa ao usuário
    const handleAssociarPrograma = async () => {
        if (!programaSelecionado) {
            setErro('Selecione um programa para adicionar.');
            return;
        }

        setAdicionando(true);
        setErro('');
        
        try {
            // POST /programas/associar
            const response = await api.post('/programas/associar', {
                programaCatalogoId: programaSelecionado
            });
            
            // Atualiza a lista localmente
            setMeusProgramas(prev => [...prev, response.data]);
            
            // Limpa o formulário
            setProgramaSelecionado('');
            
            // Mostra mensagem de sucesso
            setSucesso('Programa associado com sucesso!');
            setTimeout(() => setSucesso(''), 3000);
            
            // Recarrega os dados para atualizar o catálogo
            await carregarDados();
            
        } catch (error: unknown) {
            const apiError = error as ApiError;
            
            if (apiError.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            
            if (apiError.response?.status === 409) {
                setErro('Você já possui este programa associado.');
            } else if (apiError.response?.data?.message) {
                setErro(apiError.response.data.message);
            } else {
                setErro('Erro ao associar programa. Tente novamente.');
            }
        } finally {
            setAdicionando(false);
        }
    };

    // Remove um programa do usuário
    const handleRemoverPrograma = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja remover este programa? Os pontos serão perdidos.')) {
            return;
        }
        
        setRemovendo(id);
        setErro('');
        
        try {
            // DELETE /programas/{id}
            await api.delete(`/programas/${id}`);
            
            // Remove da lista localmente
            setMeusProgramas(prev => prev.filter(p => p.id !== id));
            
            // Mostra mensagem de sucesso
            setSucesso('Programa removido com sucesso!');
            setTimeout(() => setSucesso(''), 3000);
            
        } catch (error: unknown) {
            const apiError = error as ApiError;
            
            if (apiError.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            
            if (apiError.response?.status === 403) {
                setErro('Você não tem permissão para remover este programa.');
            } else {
                setErro('Erro ao remover programa. Tente novamente.');
            }
        } finally {
            setRemovendo(null);
        }
    };

    // Verifica se um programa já está associado
    const programaJaAssociado = (programaId: number) => {
        return meusProgramas.some(p => p.id === programaId);
    };

    // Filtra programas que ainda não foram associados
    const programasDisponiveis = catalogoProgramas.filter(
        programa => !programaJaAssociado(programa.programaId)
    );

    // Calcula total de pontos
    const totalPontos = meusProgramas.reduce((sum, p) => sum + p.saldoPontos, 0);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Botão Voltar - ACIMA do título */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft size={20} />
                    <span>Voltar para Dashboard</span>
                </button>

                {/* Cabeçalho */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <Gift className="text-indigo-500" size={28} />
                        <div>
                            <h1 className="text-3xl font-bold">Meus Programas de Pontos</h1>
                            <p className="text-slate-400 text-sm mt-1">
                                Gerencie seus programas e acompanhe seus pontos
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mensagens de feedback */}
                {sucesso && (
                    <div className="mb-6 p-4 bg-emerald-900/30 border border-emerald-800 rounded-xl">
                        <div className="flex items-center gap-2 text-emerald-300">
                            <CheckCircle size={18} />
                            <p className="text-sm">{sucesso}</p>
                        </div>
                    </div>
                )}

                {erro && (
                    <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-xl">
                        <div className="flex items-center gap-2 text-red-300">
                            <Award size={18} />
                            <p className="text-sm">{erro}</p>
                        </div>
                    </div>
                )}

                {/* Conteúdo principal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Lista de Programas do Usuário */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-300 flex items-center gap-2">
                                <Wallet size={20} />
                                Meus Programas Associados
                            </h2>
                            <span className="text-sm text-slate-400">
                                {meusProgramas.length} programa{meusProgramas.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        
                        {loading ? (
                            <div className="flex justify-center items-center py-16">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                                    <p className="text-slate-400">Carregando seus programas...</p>
                                </div>
                            </div>
                        ) : meusProgramas.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {meusProgramas.map(programa => (
                                    <div 
                                        key={programa.id} 
                                        className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Gift className="text-emerald-500" size={20} />
                                                    <h3 className="font-bold text-lg text-white">
                                                        {programa.nome}
                                                    </h3>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-xs text-slate-500">Saldo de Pontos</p>
                                                        <p className="text-2xl font-bold text-emerald-400">
                                                            {programa.saldoPontos.toLocaleString('pt-BR')} pts
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <div className="text-slate-400">
                                                            ID: <span className="font-mono text-slate-300">{programa.id}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <button
                                                onClick={() => handleRemoverPrograma(programa.id)}
                                                disabled={removendo === programa.id}
                                                className="text-slate-600 hover:text-red-400 p-2 transition-colors disabled:opacity-50 ml-2"
                                                title="Remover programa"
                                            >
                                                {removendo === programa.id ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                                                ) : (
                                                    <Trash2 size={18} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                                <Gift className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                                <p className="text-slate-500 text-lg font-medium">Nenhum programa associado</p>
                                <p className="text-sm text-slate-600 mt-2">
                                    Use o painel ao lado para adicionar seu primeiro programa
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Adicionar Programa + Estatísticas */}
                    <div className="space-y-6">
                        {/* Adicionar Novo Programa */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-slate-300 mb-6 flex items-center gap-2">
                                <Plus size={20} />
                                Adicionar Programa
                            </h2>
                            
                            {programasDisponiveis.length > 0 ? (
                                <div className="space-y-4">
                                    <label className="block text-sm text-slate-400">
                                        Selecione um programa do catálogo:
                                    </label>
                                    
                                    <select
                                        value={programaSelecionado}
                                        onChange={(e) => {
                                            setProgramaSelecionado(e.target.value ? Number(e.target.value) : '');
                                            setErro('');
                                        }}
                                        className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all"
                                    >
                                        <option value="">Escolha um programa...</option>
                                        {programasDisponiveis.map(programa => (
                                            <option key={programa.programaId} value={programa.programaId}>
                                                {programa.nome} ({programa.multiplicadorBase.toFixed(1)}x)
                                            </option>
                                        ))}
                                    </select>
                                    
                                    {programaSelecionado && (
                                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                                            <p className="font-bold text-white mb-1">
                                                {programasDisponiveis.find(p => p.programaId === programaSelecionado)?.nome}
                                            </p>
                                            <p className="text-sm text-slate-400 mb-2">
                                                {programasDisponiveis.find(p => p.programaId === programaSelecionado)?.descricao}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-indigo-400 font-medium">
                                                    Multiplicador: {programasDisponiveis.find(p => p.programaId === programaSelecionado)?.multiplicadorBase.toFixed(1)}x
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <button
                                        onClick={handleAssociarPrograma}
                                        disabled={!programaSelecionado || adicionando}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:cursor-not-allowed p-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all"
                                    >
                                        {adicionando ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Associando...
                                            </>
                                        ) : (
                                            <>
                                                <Plus size={18} />
                                                Associar Programa
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <Star className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                    <p className="text-slate-500 font-medium">Todos os programas já foram associados</p>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Parabéns! Você já tem acesso a todos os programas disponíveis.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Estatísticas */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                            <h3 className="font-bold text-slate-300 mb-6 flex items-center gap-2">
                                <Award size={18} />
                                Resumo
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                                    <span className="text-slate-400">Programas ativos</span>
                                    <span className="font-bold text-lg">{meusProgramas.length}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                                    <span className="text-slate-400">Total de pontos</span>
                                    <span className="font-bold text-lg text-emerald-400">
                                        {totalPontos.toLocaleString('pt-BR')} pts
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                                    <span className="text-slate-400">Programas disponíveis</span>
                                    <span className="font-bold text-lg text-indigo-400">
                                        {programasDisponiveis.length}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Catálogo total</span>
                                    <span className="font-bold text-lg text-slate-300">
                                        {catalogoProgramas.length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}