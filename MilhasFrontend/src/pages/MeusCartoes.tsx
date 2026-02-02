import { useState, useEffect, useCallback } from 'react';
import { CreditCard, Save, Loader2, ArrowLeft, Trash2, Wallet, Gift } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface CartaoCadastrado {
    id: number;
    nomeCartao: string;
    bandeira: string;
    multiplicadorPontos: number;
    programaDoUsuario?: {
        id: number;
        nome: string;
        saldoPontos: number;
        programaCatalogo?: {
            programaId: number;
            nome: string;
        }
    };
}

interface CatalogoResponse {
    bin: string;
    banco: string;
    nomeExibicao: string;
    bandeira: string;
    multiplicadorPadrao: number;
}

interface ProgramaDoUsuario {
    id: number;
    nome: string;
    saldoPontos: number;
    programaCatalogo?: {
        programaId: number;
        nome: string;
    };
}

interface ProgramaCatalogo {
    id: number;
    nome: string;
    descricao: string;
    multiplicadorBase: number;
    prazoCreditoDias: number;
}

interface ApiError {
    response?: {
        status: number;
        data?: {
            message?: string;
        };
    };
    message?: string;
}

// Lista fixa dos programas disponíveis no catálogo (do seu arquivo de configuração)
const PROGRAMAS_DISPONIVEIS_CATALOGO = [
    { id: 1, nome: 'Smiles', palavrasChave: ['smiles', 'gol'] },
    { id: 2, nome: 'Azul', palavrasChave: ['azul', 'tudoazul'] },
    { id: 3, nome: 'Latam Pass', palavrasChave: ['latam', 'pass', 'latampass'] },
    { id: 4, nome: 'Livelo', palavrasChave: ['livelo', 'bradesco', 'banco do brasil'] },
    { id: 5, nome: 'Esfera', palavrasChave: ['esfera', 'santander'] }
];

export function MeusCartoes() {
    const navigate = useNavigate();
    
    const [cartoes, setCartoes] = useState<CartaoCadastrado[]>([]);
    const [programasDoUsuario, setProgramasDoUsuario] = useState<ProgramaDoUsuario[]>([]);
    const [numeroCartao, setNumeroCartao] = useState('');
    const [nomePersonalizado, setNomePersonalizado] = useState('');
    const [programaSelecionado, setProgramaSelecionado] = useState<number | ''>('');
    const [dadosDetectados, setDadosDetectados] = useState<CatalogoResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [loadingProgramas, setLoadingProgramas] = useState(false);
    const [loadingCatalogo, setLoadingCatalogo] = useState(false);
    const [erroBin, setErroBin] = useState('');

    const formatarParaExibicao = (valor: string) => {
        const apenasNumeros = valor.replace(/\D/g, '').padEnd(16, '•');
        return apenasNumeros.replace(/(.{4})/g, '$1 ').trim();
    };

    // Função para verificar se há token válido
    const verificarAutenticacao = useCallback(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Sessão expirada. Faça login novamente.');
            navigate('/login');
            return false;
        }
        return true;
    }, [navigate]);

    // Função para tratar erros de autenticação
    const tratarErroAutenticacao = useCallback((error: ApiError) => {
        if (error?.response?.status === 401) {
            alert('Sessão expirada. Faça login novamente.');
            navigate('/login');
        }
    }, [navigate]);

    // Função para mapear nome do programa do usuário para um programa do catálogo
    const mapearProgramaParaCatalogo = useCallback((nomeProgramaUsuario: string): { id: number; nome: string } | null => {
        if (!nomeProgramaUsuario) return null;
        
        const nomeLower = nomeProgramaUsuario.toLowerCase().trim();
        
        // Procura por correspondência exata primeiro
        for (const programa of PROGRAMAS_DISPONIVEIS_CATALOGO) {
            if (nomeLower === programa.nome.toLowerCase()) {
                return { id: programa.id, nome: programa.nome };
            }
        }
        
        // Procura por palavras-chave
        for (const programa of PROGRAMAS_DISPONIVEIS_CATALOGO) {
            for (const palavraChave of programa.palavrasChave) {
                if (nomeLower.includes(palavraChave.toLowerCase())) {
                    return { id: programa.id, nome: programa.nome };
                }
            }
        }
        
        return null; // Não encontrou correspondência
    }, []);

    // Função para normalizar o nome do programa para exibição
    const normalizarNomePrograma = useCallback((nomeProgramaUsuario: string): string => {
        const programaCatalogo = mapearProgramaParaCatalogo(nomeProgramaUsuario);
        return programaCatalogo ? programaCatalogo.nome : nomeProgramaUsuario;
    }, [mapearProgramaParaCatalogo]);

    // Carregar programas do catálogo (apenas os 5 existentes: IDs 1-5)
    const carregarProgramasCatalogo = useCallback(async () => {
        try {
            setLoadingCatalogo(true);
            console.log('🔄 Carregando programas do catálogo...');
            
            const res = await api.get('/programas-catalogo');
            console.log('✅ Programas catálogo carregados:', res.data);
            
            // Filtrar apenas os 5 programas válidos
            const programasValidos = res.data.filter((programa: ProgramaCatalogo) => 
                PROGRAMAS_DISPONIVEIS_CATALOGO.some(p => p.id === programa.id)
            );
            
            console.log('✅ Programas filtrados (apenas válidos):', programasValidos);
            setProgramasDoUsuario(programasValidos);
            return programasValidos;
        } catch (error) {
            const apiError = error as ApiError;
            console.error("Erro ao carregar programas catálogo:", apiError);
            
            tratarErroAutenticacao(apiError);
            return [];
        } finally {
            setLoadingCatalogo(false);
        }
    }, [tratarErroAutenticacao]);

    // Carregar programas do usuário - filtrados para mostrar apenas os que podem ser associados
    const carregarProgramasDoUsuario = useCallback(async () => {
        try {
            setLoadingProgramas(true);
            console.log('🔄 Carregando programas do usuário...');
            
            if (!verificarAutenticacao()) return;
            
            const res = await api.get('/programas_usuario');
            console.log('📋 Programas do usuário (bruto):', res.data);
            
            // Filtra apenas programas que podem ser mapeados para o catálogo
            const programasFiltrados = res.data.filter((programa: ProgramaDoUsuario) => {
                const programaMapeado = mapearProgramaParaCatalogo(programa.nome);
                return programaMapeado !== null;
            });
            
            // Adiciona informações do catálogo aos programas filtrados
            const programasComCatalogo = programasFiltrados.map((programa: ProgramaDoUsuario) => {
                const programaMapeado = mapearProgramaParaCatalogo(programa.nome);
                return {
                    ...programa,
                    // Se já tem programaCatalogo, mantém; senão, adiciona o mapeado
                    programaCatalogo: programa.programaCatalogo || (programaMapeado ? {
                        programaId: programaMapeado.id,
                        nome: programaMapeado.nome
                    } : undefined)
                };
            });
            
            console.log('✅ Programas do usuário (filtrados):', programasComCatalogo);
            
            // Log dos programas descartados
            const programasDescartados = res.data.filter((programa: ProgramaDoUsuario) => {
                const programaMapeado = mapearProgramaParaCatalogo(programa.nome);
                return programaMapeado === null;
            });
            
            if (programasDescartados.length > 0) {
    console.warn('⚠️ Programas descartados (não mapeáveis):', programasDescartados.map((p: ProgramaDoUsuario) => p.nome));
}
            
            setProgramasDoUsuario(programasComCatalogo);
            
            if (programasComCatalogo.length > 0) {
                setProgramaSelecionado(programasComCatalogo[0].id);
            } else {
                setProgramaSelecionado('');
            }
            
            return programasComCatalogo;
        } catch (error) {
            const apiError = error as ApiError;
            console.error("Erro ao carregar programas do usuário:", apiError);
            
            tratarErroAutenticacao(apiError);
            return [];
        } finally {
            setLoadingProgramas(false);
        }
    }, [verificarAutenticacao, tratarErroAutenticacao, mapearProgramaParaCatalogo]);

    // Carregar cartões do usuário logado
    const carregarCartoes = useCallback(async () => {
        try {
            setFetching(true);
            console.log('🔄 Carregando cartões...');
            
            if (!verificarAutenticacao()) return;
            
            const res = await api.get('/cartoes');
            console.log('✅ Cartões carregados:', res.data);
            setCartoes(res.data);
        } catch (error) {
            const apiError = error as ApiError;
            console.error("❌ Erro ao carregar cartões:", apiError);
            
            tratarErroAutenticacao(apiError);
        } finally {
            setFetching(false);
        }
    }, [verificarAutenticacao, tratarErroAutenticacao]);

    // Carregar todos os dados
    const carregarTodosDados = useCallback(async () => {
        if (!verificarAutenticacao()) return;
        
        try {
            setFetching(true);
            console.log('🔄 Iniciando carregamento de todos os dados...');
            
            // Carrega em sequência para evitar race conditions
            await carregarProgramasCatalogo();
            await carregarProgramasDoUsuario();
            await carregarCartoes();
            
            console.log('✅ Todos os dados carregados com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
        } finally {
            setFetching(false);
        }
    }, [verificarAutenticacao, carregarProgramasCatalogo, carregarProgramasDoUsuario, carregarCartoes]);

    useEffect(() => {
        carregarTodosDados();
    }, [carregarTodosDados]);

    // Detectar BIN
    useEffect(() => {
        const algarismos = numeroCartao.replace(/\D/g, '');
        setErroBin('');
        
        if (algarismos.length >= 6) {
            const bin = algarismos.substring(0, 6);
            api.get(`/cartoes/identificar/${bin}`)
                .then(res => {
                    setDadosDetectados(res.data);
                    if (!nomePersonalizado && res.data.nomeExibicao) {
                        setNomePersonalizado(res.data.nomeExibicao);
                    }
                })
                .catch((error) => {
                    const apiError = error as ApiError;
                    console.error("Erro ao detectar BIN:", apiError);
                    setDadosDetectados(null);
                    setErroBin('BIN não reconhecido');
                });
        } else {
            setDadosDetectados(null);
        }
    }, [numeroCartao, nomePersonalizado]);

    // Handler número do cartão
    const handleNumeroCartaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 16) value = value.substring(0, 16);
        const formatted = value.replace(/(.{4})/g, '$1 ').trim();
        setNumeroCartao(formatted);
    };

    // SALVAR CARTÃO
    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!dadosDetectados) {
            alert('Digite o número do cartão para identificação automática');
            return;
        }

        if (!programaSelecionado && programasDoUsuario.length > 0) {
            alert('Selecione um programa de pontos para associar ao cartão');
            return;
        }

        if (!verificarAutenticacao()) return;

        setLoading(true);
        try {
            const programaUsuario = programasDoUsuario.find(p => p.id === programaSelecionado);
            let programaCatalogoId: number | null = null;
            let nomeCatalogo = '';

            if (programaUsuario) {
                // Usa o programaCatalogo já mapeado ou tenta mapear
                if (programaUsuario.programaCatalogo) {
                    programaCatalogoId = programaUsuario.programaCatalogo.programaId;
                    nomeCatalogo = programaUsuario.programaCatalogo.nome;
                } else {
                    const programaMapeado = mapearProgramaParaCatalogo(programaUsuario.nome);
                    if (programaMapeado) {
                        programaCatalogoId = programaMapeado.id;
                        nomeCatalogo = programaMapeado.nome;
                    }
                }
            }

            const dadosParaEnviar = {
                nomeCartao: nomePersonalizado.trim() || dadosDetectados.nomeExibicao,
                bandeira: dadosDetectados.bandeira,
                multiplicadorPontos: dadosDetectados.multiplicadorPadrao,
                programaId: programaCatalogoId,
                id: 0,
                nomeUsuario: "",
                nomePrograma: nomeCatalogo,
                saldoPontos: 0
            };

            console.log('🔄 Enviando dados:', dadosParaEnviar);
            console.log('Programa selecionado:', programaUsuario);
            console.log('Programa Catalogo ID:', programaCatalogoId);

            const response = await api.post('/cartoes', dadosParaEnviar);
            console.log('✅ Resposta do backend:', response.data);

            // Limpa o formulário
            setNumeroCartao('');
            setNomePersonalizado('');
            setProgramaSelecionado(programasDoUsuario.length > 0 ? programasDoUsuario[0].id : '');
            setDadosDetectados(null);
            
            // Recarrega os cartões
            await carregarCartoes();
            
            alert('Cartão salvo com sucesso!');
        } catch (error) {
            const apiError = error as ApiError;
            console.error("❌ Erro ao salvar cartão:", apiError);
            
            if (apiError?.response?.status === 409) {
                alert('Este cartão já está cadastrado!');
            } else if (apiError?.response?.status === 400) {
                const message = apiError.response?.data?.message || 'Verifique os dados';
                alert(`Erro: ${message}`);
            } else if (apiError?.response?.status === 401) {
                alert('Sessão expirada. Faça login novamente.');
                navigate('/login');
            } else {
                alert('Erro ao salvar cartão. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Excluir cartão
    const handleExcluir = async (id: number) => {
        if (!window.confirm("Excluir este cartão?")) return;
        
        if (!verificarAutenticacao()) return;
        
        try {
            await api.delete(`/cartoes/${id}`);
            await carregarCartoes();
            alert('Cartão excluído!');
        } catch (error) {
            const apiError = error as ApiError;
            console.error("Erro ao excluir:", apiError);
            
            if (apiError?.response?.status === 401) {
                alert('Sessão expirada. Faça login novamente.');
                navigate('/login');
            } else {
                alert('Erro ao excluir cartão');
            }
        }
    };

    // Cor do cartão
    const obterCorCartao = (banco?: string): string => {
        if (!banco) return 'bg-slate-800 border border-slate-700';
        const b = banco.toLowerCase();
        if (b.includes('ita')) return 'bg-orange-700 border-orange-600';
        if (b.includes('amex') || b.includes('american')) return 'bg-emerald-700 border-emerald-600';
        if (b.includes('nubank')) return 'bg-purple-800 border-purple-700';
        if (b.includes('bradesco')) return 'bg-red-800 border-red-700';
        if (b.includes('santander')) return 'bg-red-700 border-red-600';
        if (b.includes('bb') || b.includes('banco do brasil')) return 'bg-yellow-700 border-yellow-600';
        return 'bg-indigo-800 border-indigo-700';
    };

    // Obter nome do programa selecionado (normalizado)
    const getNomeProgramaSelecionado = (): string => {
        if (!programaSelecionado) return "Nenhum";
        const programa = programasDoUsuario.find(p => p.id === programaSelecionado);
        return programa ? normalizarNomePrograma(programa.nome) : "Programa";
    };

    // Verifica se um programa pode ser associado
    const programaPodeSerAssociado = (nomePrograma: string): boolean => {
        return mapearProgramaParaCatalogo(nomePrograma) !== null;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft size={20} /> 
                    Voltar para Dashboard
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Lista de Cartões */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="flex items-center gap-3">
                            <Wallet className="text-indigo-500" />
                            <h2 className="text-2xl font-bold">Meus Cartões</h2>
                            <span className="text-sm text-slate-500">
                                ({cartoes.length} cartões)
                            </span>
                        </div>

                        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                            {fetching ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="animate-spin text-indigo-500" />
                                    <span className="ml-2">Carregando cartões...</span>
                                </div>
                            ) : cartoes.length > 0 ? (
                                cartoes.map(cartao => (
                                    <div key={cartao.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-indigo-500/50 transition-all hover:bg-slate-800/50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-indigo-400">
                                                    <CreditCard size={24} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg">{cartao.nomeCartao}</p>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        <span className="text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700">
                                                            {cartao.bandeira}
                                                        </span>
                                                        <span className="text-xs bg-indigo-900 px-2 py-1 rounded border border-indigo-800">
                                                            {cartao.multiplicadorPontos?.toFixed(1)}x
                                                        </span>
                                                        {cartao.programaDoUsuario?.programaCatalogo?.nome && (
                                                            <span className="text-xs bg-emerald-900 px-2 py-1 rounded border border-emerald-800 flex items-center gap-1">
                                                                <Gift size={10} />
                                                                {cartao.programaDoUsuario.programaCatalogo.nome}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleExcluir(cartao.id)}
                                                className="text-slate-600 hover:text-red-400 p-2 transition-colors"
                                                title="Excluir cartão"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        {cartao.programaDoUsuario && (
                                            <div className="mt-3 text-xs text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Gift size={10} />
                                                    {cartao.programaDoUsuario.nome}: {cartao.programaDoUsuario.saldoPontos.toLocaleString()} pontos
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                                    <Wallet className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                    <p className="text-slate-500">Nenhum cartão cadastrado</p>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Adicione seu primeiro cartão
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Link para Programas */}
                        {programasDoUsuario.length === 0 && !fetching && (
                            <div className="mt-6 p-4 border border-slate-800 rounded-2xl bg-slate-900">
                                <p className="text-slate-400 text-sm flex items-center gap-2">
                                    <Gift size={14} />
                                    Nenhum programa cadastrado. Para associar cartões a programas:
                                </p>
                                <button
                                    onClick={() => navigate('/meus-programas')}
                                    className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1"
                                >
                                    Cadastrar programas →
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Formulário */}
                    <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
                        <div className="flex flex-col xl:flex-row gap-8">
                            
                            <div className="flex-1 space-y-6">
                                <h3 className="text-xl font-bold text-indigo-400">NOVO CARTÃO</h3>
                                <form onSubmit={handleSalvar} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">
                                            Número do Cartão
                                        </label>
                                        <input
                                            required
                                            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-indigo-500 text-white font-mono transition-colors"
                                            placeholder="0000 0000 0000 0000"
                                            value={numeroCartao}
                                            maxLength={19}
                                            onChange={handleNumeroCartaoChange}
                                        />
                                        {erroBin && (
                                            <p className="text-xs text-amber-500">{erroBin}</p>
                                        )}
                                        <p className="text-xs text-slate-500">
                                            Os 6 primeiros dígitos identificam o cartão automaticamente
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">
                                            Apelido do Cartão
                                        </label>
                                        <input
                                            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-indigo-500 text-white transition-colors"
                                            placeholder="Ex: Cartão Principal"
                                            value={nomePersonalizado}
                                            onChange={e => setNomePersonalizado(e.target.value)}
                                        />
                                    </div>

                                    {/* Seletor de Programa */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                                <Gift size={14} />
                                                Programa de Pontos
                                            </label>
                                            {(loadingProgramas || loadingCatalogo) && (
                                                <span className="text-xs text-slate-500">Carregando...</span>
                                            )}
                                        </div>
                                        
                                        {programasDoUsuario.length > 0 ? (
                                            <>
                                                <select
                                                    value={programaSelecionado}
                                                    onChange={(e) => setProgramaSelecionado(e.target.value ? Number(e.target.value) : '')}
                                                    className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-indigo-500 text-white transition-colors"
                                                    disabled={loadingProgramas || loadingCatalogo}
                                                >
                                                    <option value="">Selecione um programa...</option>
                                                    {programasDoUsuario.map(programa => {
                                                        const nomeNormalizado = normalizarNomePrograma(programa.nome);
                                                        const podeAssociar = programaPodeSerAssociado(programa.nome);
                                                        
                                                        return (
                                                            <option 
                                                                key={programa.id} 
                                                                value={programa.id}
                                                                title={podeAssociar ? `Será associado ao catálogo: ${nomeNormalizado}` : 'Não pode ser associado'}
                                                            >
                                                                {nomeNormalizado}
                                                                {programa.saldoPontos > 0 && ` - ${programa.saldoPontos.toLocaleString()} pts`}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                                
                                                {/* Aviso sobre programas disponíveis */}
                                                <div className="mt-2 p-3 bg-amber-900/20 border border-amber-800/50 rounded-lg">
                                                    <p className="text-xs text-amber-400 font-medium">
                                                        ⓘ Programas disponíveis: Smiles, Azul, Latam Pass, Livelo, Esfera
                                                    </p>
                                                    <p className="text-xs text-amber-500 mt-1">
                                                        Apenas programas que podem ser mapeados para estes serão mostrados
                                                    </p>
                                                </div>
                                                
                                                {programaSelecionado && (
                                                    <div className="text-xs text-slate-500 space-y-1">
                                                        <div>
                                                            Programa selecionado: <span className="text-emerald-400">{getNomeProgramaSelecionado()}</span>
                                                        </div>
                                                        <div>
                                                            Será associado ao catálogo: <span className="text-amber-400">{getNomeProgramaSelecionado()}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : !loadingProgramas && !loadingCatalogo ? (
                                            <div className="p-4 border border-slate-800 rounded-xl bg-slate-900">
                                                <p className="text-slate-400 text-sm">
                                                    Você não tem programas cadastrados que possam ser associados aos cartões.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate('/meus-programas')}
                                                    className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                                                >
                                                    Cadastrar programas primeiro →
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>

                                    {dadosDetectados && (
                                        <div className="p-4 bg-indigo-900/30 border border-indigo-800 rounded-xl">
                                            <p className="text-indigo-400 text-xs uppercase font-bold mb-1">
                                                IDENTIFICAÇÃO AUTOMÁTICA
                                            </p>
                                            <p className="text-white font-bold">{dadosDetectados.nomeExibicao}</p>
                                            <p className="text-slate-500 text-xs uppercase mt-1">
                                                {dadosDetectados.bandeira} • {dadosDetectados.multiplicadorPadrao} pontos por $
                                            </p>
                                            <p className="text-slate-600 text-xs mt-1">
                                                Banco: {dadosDetectados.banco}
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={!dadosDetectados || loading || (programasDoUsuario.length > 0 && !programaSelecionado) || loadingCatalogo}
                                        className={`w-full p-4 rounded-xl font-bold flex justify-center items-center gap-2 text-white transition-all shadow-lg ${
                                            (!dadosDetectados || loading || (programasDoUsuario.length > 0 && !programaSelecionado) || loadingCatalogo)
                                                ? 'bg-slate-800 border border-slate-700 cursor-not-allowed'
                                                : 'bg-indigo-700 border border-indigo-600 hover:bg-indigo-600 cursor-pointer'
                                        }`}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={20} />
                                                Salvar Cartão
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>

                            {/* Preview do Cartão */}
                            <div className="flex items-center justify-center py-6">
                                <div className={`w-80 h-48 rounded-2xl p-6 flex flex-col justify-between shadow-2xl transition-all duration-300 ${obterCorCartao(dadosDetectados?.banco)}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-9 bg-amber-200/40 border border-amber-300/20 rounded-lg flex items-center justify-center">
                                            <div className="w-8 h-6 bg-amber-300 border border-black/10 rounded-sm" />
                                        </div>
                                        <span className="text-white/30 tracking-[0.3em] uppercase font-black text-[9px]">
                                            {dadosDetectados?.bandeira || "BANDEIRA"}
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-lg font-mono tracking-[0.18em] text-white/90">
                                            {formatarParaExibicao(numeroCartao)}
                                        </p>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[8px] text-white/40 uppercase font-black tracking-widest">Titular</p>
                                                <p className="text-[10px] text-white font-bold uppercase truncate max-w-35">
                                                    {nomePersonalizado || dadosDetectados?.nomeExibicao || "Aguardando..."}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] text-white/40 uppercase font-black tracking-widest">Programa</p>
                                                <p className="text-[10px] text-white font-bold font-mono truncate max-w-24">
                                                    {getNomeProgramaSelecionado()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}