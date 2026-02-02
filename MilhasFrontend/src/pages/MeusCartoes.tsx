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

export function MeusCartoes() {
    const navigate = useNavigate();
    
    const [cartoes, setCartoes] = useState<CartaoCadastrado[]>([]);
    const [programasDoUsuario, setProgramasDoUsuario] = useState<ProgramaDoUsuario[]>([]);
    const [programasCatalogo, setProgramasCatalogo] = useState<ProgramaCatalogo[]>([]);
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

    // Carregar programas do catálogo (Smiles, Azul, etc.)
    const carregarProgramasCatalogo = useCallback(async () => {
        try {
            setLoadingCatalogo(true);
            console.log('🔄 Carregando programas do catálogo...');
            
            const res = await api.get('/programas-catalogo');
            console.log('✅ Programas catálogo carregados:', res.data);
            
            setProgramasCatalogo(res.data);
        } catch (error) {
            const apiError = error as ApiError;
            console.error("Erro ao carregar programas catálogo:", apiError);
            
            // Verifica se é erro de autenticação
            tratarErroAutenticacao(apiError);
        } finally {
            setLoadingCatalogo(false);
        }
    }, [tratarErroAutenticacao]);

    // Carregar programas do usuário
    const carregarProgramasDoUsuario = useCallback(async () => {
        try {
            setLoadingProgramas(true);
            console.log('🔄 Carregando programas do usuário...');
            
            // Verifica autenticação antes de fazer a requisição
            if (!verificarAutenticacao()) return;
            
            const res = await api.get('/programas_usuario');
            console.log('✅ Programas do usuário carregados:', res.data);
            
            setProgramasDoUsuario(res.data);
            
            // Seleciona o primeiro programa se existir
            if (res.data.length > 0) {
                setProgramaSelecionado(res.data[0].id);
            }
        } catch (error) {
            const apiError = error as ApiError;
            console.error("Erro ao carregar programas do usuário:", apiError);
            
            // Verifica se é erro de autenticação
            tratarErroAutenticacao(apiError);
        } finally {
            setLoadingProgramas(false);
        }
    }, [verificarAutenticacao, tratarErroAutenticacao]);

    // Carregar cartões do usuário logado
    const carregarCartoes = useCallback(async () => {
        try {
            setFetching(true);
            console.log('🔄 Carregando cartões...');
            
            // Verifica autenticação antes de fazer a requisição
            if (!verificarAutenticacao()) return;
            
            const res = await api.get('/cartoes');
            console.log('✅ Cartões carregados:', res.data);
            setCartoes(res.data);
        } catch (error) {
            const apiError = error as ApiError;
            console.error("❌ Erro ao carregar cartões:", apiError);
            
            // Verifica se é erro de autenticação
            tratarErroAutenticacao(apiError);
        } finally {
            setFetching(false);
        }
    }, [verificarAutenticacao, tratarErroAutenticacao]);

    useEffect(() => {
        carregarProgramasCatalogo();
        carregarProgramasDoUsuario();
        carregarCartoes();
    }, [carregarProgramasCatalogo, carregarProgramasDoUsuario, carregarCartoes]);

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

    // Função para encontrar o ID correto do catálogo baseado no nome do programa
    const encontrarProgramaCatalogoId = (nomeProgramaUsuario: string): number | null => {
        if (!nomeProgramaUsuario) return null;
        
        const nomeLower = nomeProgramaUsuario.toLowerCase();
        
        // Mapeamento específico para evitar confusão entre programas similares
        if (nomeLower.includes('azul') || nomeLower.includes('tudoazul')) {
            // Verifica se é TudoAzul ou Azul
            const programaCatalogo = programasCatalogo.find(p => 
                p.nome.toLowerCase().includes('tudoazul') || 
                p.nome.toLowerCase().includes('azul')
            );
            return programaCatalogo?.id || null;
        }
        
        if (nomeLower.includes('smiles')) {
            const programaCatalogo = programasCatalogo.find(p => 
                p.nome.toLowerCase().includes('smiles')
            );
            return programaCatalogo?.id || null;
        }
        
        if (nomeLower.includes('latam') || nomeLower.includes('pass')) {
            const programaCatalogo = programasCatalogo.find(p => 
                p.nome.toLowerCase().includes('latam')
            );
            return programaCatalogo?.id || null;
        }
        
        if (nomeLower.includes('multiplus')) {
            const programaCatalogo = programasCatalogo.find(p => 
                p.nome.toLowerCase().includes('multiplus')
            );
            return programaCatalogo?.id || null;
        }
        
        if (nomeLower.includes('livelo')) {
            const programaCatalogo = programasCatalogo.find(p => 
                p.nome.toLowerCase().includes('livelo')
            );
            return programaCatalogo?.id || null;
        }
        
        if (nomeLower.includes('esfera')) {
            const programaCatalogo = programasCatalogo.find(p => 
                p.nome.toLowerCase().includes('esfera')
            );
            return programaCatalogo?.id || null;
        }
        
        // Busca genérica como fallback
        for (const programaCatalogo of programasCatalogo) {
            if (nomeLower.includes(programaCatalogo.nome.toLowerCase())) {
                return programaCatalogo.id;
            }
        }
        
        return null;
    };

    // SALVAR CARTÃO COM PROGRAMA SELECIONADO CORRETAMENTE
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

        // Verifica autenticação antes de tentar salvar
        if (!verificarAutenticacao()) return;

        setLoading(true);
        try {
            // Encontra o programa do usuário selecionado
            const programaUsuario = programasDoUsuario.find(p => p.id === programaSelecionado);
            let programaCatalogoId: number | null = null;
            let nomeCatalogo = '';

            if (programaUsuario) {
                // Tenta primeiro usar o programaCatalogo vinculado (se existir)
                if (programaUsuario.programaCatalogo) {
                    programaCatalogoId = programaUsuario.programaCatalogo.programaId;
                    nomeCatalogo = programaUsuario.programaCatalogo.nome;
                } else {
                    // Se não tiver programaCatalogo vinculado, busca pelo nome
                    programaCatalogoId = encontrarProgramaCatalogoId(programaUsuario.nome);
                    
                    // Se encontrou, busca o nome do catálogo
                    if (programaCatalogoId) {
                        const programaCatalogo = programasCatalogo.find(p => p.id === programaCatalogoId);
                        nomeCatalogo = programaCatalogo?.nome || '';
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
            console.log('Programa do Usuário selecionado:', programaUsuario);
            console.log('Programa Catalogo ID encontrado:', programaCatalogoId);
            console.log('Nome do Catálogo:', nomeCatalogo);
            console.log('Todos programas catálogo:', programasCatalogo);

            const response = await api.post('/cartoes', dadosParaEnviar);
            console.log('✅ Resposta do backend:', response.data);

            setNumeroCartao('');
            setNomePersonalizado('');
            setProgramaSelecionado('');
            setDadosDetectados(null);
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
        
        // Verifica autenticação antes de tentar excluir
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

    // Cor do cartão - SEM GRADIENTE, APENAS CORES SÓLIDAS
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

    // Obter nome do programa selecionado para exibição
    const getNomeProgramaSelecionado = (): string => {
        if (!programaSelecionado) return "Nenhum";
        const programa = programasDoUsuario.find(p => p.id === programaSelecionado);
        return programa ? programa.nome : "Programa";
    };

    // Obter nome do catálogo para o programa selecionado
    const getNomeCatalogoSelecionado = (): string => {
        if (!programaSelecionado) return "Nenhum";
        const programaUsuario = programasDoUsuario.find(p => p.id === programaSelecionado);
        if (!programaUsuario) return "Programa";
        
        // Tenta pegar do programaCatalogo vinculado
        if (programaUsuario.programaCatalogo) {
            return programaUsuario.programaCatalogo.nome;
        }
        
        // Se não tiver, busca no catálogo pelo nome
        const programaCatalogoId: number | null = encontrarProgramaCatalogoId(programaUsuario.nome);
        if (programaCatalogoId) {
            const programaCatalogo = programasCatalogo.find(p => p.id === programaCatalogoId);
            return programaCatalogo?.nome || "Catálogo não encontrado";
        }
        
        return "Não associado ao catálogo";
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
                        {programasDoUsuario.length === 0 && (
                            <div className="mt-6 p-4 border border-slate-800 rounded-2xl bg-slate-900">
                                <p className="text-slate-400 text-sm flex items-center gap-2">
                                    <Gift size={14} />
                                    Nenhum programa cadastrado. Para associar cartões a programas:
                                </p>
                                <button
                                    onClick={() => navigate('/programas_catalogo')}
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
                                                    {programasDoUsuario.map(programa => (
                                                        <option key={programa.id} value={programa.id}>
                                                            {programa.nome}
                                                            {programa.programaCatalogo && ` (${programa.programaCatalogo.nome})`}
                                                            {programa.saldoPontos > 0 && ` - ${programa.saldoPontos.toLocaleString()} pts`}
                                                        </option>
                                                    ))}
                                                </select>
                                                
                                                {programaSelecionado && (
                                                    <div className="text-xs text-slate-500 space-y-1">
                                                        <div>
                                                            Programa selecionado: <span className="text-emerald-400">{getNomeProgramaSelecionado()}</span>
                                                        </div>
                                                        <div>
                                                            Será associado ao catálogo: <span className="text-amber-400">{getNomeCatalogoSelecionado()}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="p-4 border border-slate-800 rounded-xl bg-slate-900">
                                                <p className="text-slate-400 text-sm">
                                                    Você não tem programas cadastrados.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate('/meus-programas')}
                                                    className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                                                >
                                                    Cadastrar programas primeiro →
                                                </button>
                                            </div>
                                        )}
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
                                                    {getNomeCatalogoSelecionado()}
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