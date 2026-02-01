import { useState, useEffect, useCallback } from 'react';
import { Gift, Plus, Trash2, Star, Wallet, Award } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface ProgramaDoUsuario {
    id: number;
    nome: string;
    saldoPontos: number;
    programaCatalogo: {
        programaId: number;
        nome: string;
        descricao: string;
        multiplicadorBase: number;
    };
}

interface ProgramaCatalogo {
    programaId: number;
    nome: string;
    descricao: string;
    multiplicadorBase: number;
}

export function MeusProgramas() {
    const navigate = useNavigate();
    
    const [meusProgramas, setMeusProgramas] = useState<ProgramaDoUsuario[]>([]);
    const [catalogoProgramas, setCatalogoProgramas] = useState<ProgramaCatalogo[]>([]);
    const [loading, setLoading] = useState(true);
    const [adicionando, setAdicionando] = useState(false);
    const [programaSelecionado, setProgramaSelecionado] = useState<number | ''>('');

    // Carregar programas do usuário
    const carregarMeusProgramas = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/programas/usuario');
            setMeusProgramas(res.data);
        } catch (error) {
            console.error("Erro ao carregar programas:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Carregar catálogo de programas
    const carregarCatalogo = useCallback(async () => {
        try {
            const res = await api.get('/programas/catalogo');
            setCatalogoProgramas(res.data);
        } catch (error) {
            console.error("Erro ao carregar catálogo:", error);
        }
    }, []);

    useEffect(() => {
        carregarMeusProgramas();
        carregarCatalogo();
    }, [carregarMeusProgramas, carregarCatalogo]);

    // Adicionar programa
    const handleAdicionarPrograma = async () => {
        if (!programaSelecionado) {
            alert('Selecione um programa!');
            return;
        }

        setAdicionando(true);
        try {
            await api.post('/programas/associar', {
                programaCatalogoId: programaSelecionado
            });
            
            await carregarMeusProgramas();
            setProgramaSelecionado('');
            alert('Programa adicionado com sucesso!');
        } catch (error) {
            console.error("Erro ao adicionar programa:", error);
            alert('Erro ao adicionar programa');
        } finally {
            setAdicionando(false);
        }
    };

    // Remover programa
    const handleRemoverPrograma = async (id: number) => {
        if (!window.confirm('Remover este programa?')) return;
        
        try {
            await api.delete(`/programas/${id}`);
            await carregarMeusProgramas();
            alert('Programa removido!');
        } catch (error) {
            console.error("Erro ao remover:", error);
            alert('Não foi possível remover o programa');
        }
    };

    // Verificar se programa já está associado
    const programaJaAssociado = (programaId: number) => {
        return meusProgramas.some(p => p.programaCatalogo.programaId === programaId);
    };

    // Filtrar programas não associados
    const programasDisponiveis = catalogoProgramas.filter(
        programa => !programaJaAssociado(programa.programaId)
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <Award className="text-indigo-500" size={28} />
                        <h1 className="text-3xl font-bold">Meus Programas de Pontos</h1>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-slate-400 hover:text-white"
                    >
                        Voltar ao Dashboard
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Lista de Programas do Usuário */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-slate-300 flex items-center gap-2">
                            <Wallet size={20} />
                            Programas Associados
                        </h2>
                        
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : meusProgramas.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {meusProgramas.map(programa => (
                                    <div key={programa.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Gift className="text-emerald-500" size={20} />
                                                    <h3 className="font-bold text-lg">{programa.programaCatalogo.nome}</h3>
                                                </div>
                                                <p className="text-slate-400 text-sm mb-3">
                                                    {programa.programaCatalogo.descricao}
                                                </p>
                                                <div className="flex gap-4">
                                                    <div>
                                                        <p className="text-xs text-slate-500">Saldo</p>
                                                        <p className="text-xl font-bold text-emerald-400">
                                                            {programa.saldoPontos.toLocaleString()} pts
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500">Multiplicador</p>
                                                        <p className="text-xl font-bold text-indigo-400">
                                                            {programa.programaCatalogo.multiplicadorBase}x
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoverPrograma(programa.id)}
                                                className="text-slate-600 hover:text-red-400 p-2"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl">
                                <Gift className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                                <p className="text-slate-500">Nenhum programa associado</p>
                                <p className="text-sm text-slate-600 mt-2">
                                    Adicione programas para acumular pontos
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Adicionar Novo Programa */}
                    <div className="space-y-6">
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-slate-300 mb-4 flex items-center gap-2">
                                <Plus size={20} />
                                Adicionar Programa
                            </h2>
                            
                            {programasDisponiveis.length > 0 ? (
                                <>
                                    <div className="space-y-4">
                                        <select
                                            value={programaSelecionado}
                                            onChange={(e) => setProgramaSelecionado(e.target.value ? Number(e.target.value) : '')}
                                            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white"
                                        >
                                            <option value="">Selecione um programa</option>
                                            {programasDisponiveis.map(programa => (
                                                <option key={programa.programaId} value={programa.programaId}>
                                                    {programa.nome} - {programa.descricao}
                                                </option>
                                            ))}
                                        </select>
                                        
                                        {programaSelecionado && (
                                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                                                <p className="font-bold text-white">
                                                    {programasDisponiveis.find(p => p.programaId === programaSelecionado)?.nome}
                                                </p>
                                                <p className="text-sm text-slate-400 mt-1">
                                                    Multiplicador: {programasDisponiveis.find(p => p.programaId === programaSelecionado)?.multiplicadorBase}x
                                                </p>
                                            </div>
                                        )}
                                        
                                        <button
                                            onClick={handleAdicionarPrograma}
                                            disabled={!programaSelecionado || adicionando}
                                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 p-3 rounded-xl font-bold flex justify-center items-center gap-2"
                                        >
                                            {adicionando ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Adicionando...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus size={18} />
                                                    Associar Programa
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-6">
                                    <Star className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                    <p className="text-slate-500">Todos os programas já foram associados</p>
                                </div>
                            )}
                        </div>

                        {/* Estatísticas */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                            <h3 className="font-bold text-slate-300 mb-4">Resumo</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Programas ativos</span>
                                    <span className="font-bold">{meusProgramas.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Total de pontos</span>
                                    <span className="font-bold text-emerald-400">
                                        {meusProgramas.reduce((sum, p) => sum + p.saldoPontos, 0).toLocaleString()} pts
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Cartões vinculados</span>
                                    <span className="font-bold">
                                        {meusProgramas.length * 2} {/* Exemplo - ajuste conforme sua lógica */}
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