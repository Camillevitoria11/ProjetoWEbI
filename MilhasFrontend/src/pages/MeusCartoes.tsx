import { useState, useEffect, useCallback } from 'react';
import { CreditCard, Save, Loader2, ArrowLeft, Trash2, Wallet } from 'lucide-react';
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
        };
    };
}

interface CatalogoResponse {
    bin: string;
    banco: string;
    nomeExibicao: string;
    bandeira: string;
    multiplicadorPadrao: number;
}

export function MeusCartoes() {
    const navigate = useNavigate();
    
    const [cartoes, setCartoes] = useState<CartaoCadastrado[]>([]);
    const [numeroCartao, setNumeroCartao] = useState('');
    const [nomePersonalizado, setNomePersonalizado] = useState('');
    const [dadosDetectados, setDadosDetectados] = useState<CatalogoResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [erroBin, setErroBin] = useState('');

    const formatarParaExibicao = (valor: string) => {
        const apenasNumeros = valor.replace(/\D/g, '').padEnd(16, '•');
        return apenasNumeros.replace(/(.{4})/g, '$1 ').trim();
    };

    // Carregar cartões do usuário logado
    const carregarCartoes = useCallback(async () => {
        try {
            setFetching(true);
            console.log('🔄 Carregando cartões...');
            
            const res = await api.get('/cartoes');
            console.log('✅ Cartões carregados:', res.data);
            setCartoes(res.data);
        } catch (error: unknown) {
            console.error("❌ Erro ao carregar cartões:", error);
            
            // Tenta endpoint alternativo se necessário
            if (error instanceof Error) {
                const err = error as { response?: { status: number } };
                if (err.response?.status === 401) {
                    alert('Sessão expirada. Faça login novamente.');
                    navigate('/login');
                }
            }
        } finally {
            setFetching(false);
        }
    }, [navigate]);

    useEffect(() => {
        carregarCartoes();
    }, [carregarCartoes]);

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
                .catch(() => {
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

        setLoading(true);
        try {
            const dadosParaEnviar = {
                nomeCartao: nomePersonalizado.trim() || dadosDetectados.nomeExibicao,
                bandeira: dadosDetectados.bandeira,
                multiplicadorPontos: dadosDetectados.multiplicadorPadrao,
                programaId: null, // Deixa o backend decidir
                id: 0,
                nomeUsuario: "",
                nomePrograma: "",
                saldoPontos: 0
            };

            console.log('🔄 Enviando dados:', dadosParaEnviar);

            const response = await api.post('/cartoes', dadosParaEnviar);
            console.log('✅ Resposta do backend:', response.data);

            setNumeroCartao('');
            setNomePersonalizado('');
            setDadosDetectados(null);
            await carregarCartoes();
            
            alert('Cartão salvo com sucesso!');
        } catch (error: unknown) {
            console.error("❌ Erro ao salvar cartão:", error);
            
            if (error instanceof Error) {
                const err = error as { 
                    response?: { 
                        status: number; 
                        data?: { message?: string } 
                    } 
                };
                
                if (err.response?.status === 409) {
                    alert('Este cartão já está cadastrado!');
                } else if (err.response?.status === 400) {
                    const message = err.response.data?.message || 'Verifique os dados';
                    alert(`Erro: ${message}`);
                } else if (err.response?.status === 401) {
                    alert('Sessão expirada. Faça login novamente.');
                    navigate('/login');
                } else {
                    alert('Erro ao salvar cartão. Tente novamente.');
                }
            } else {
                alert('Erro inesperado. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Excluir cartão
    const handleExcluir = async (id: number) => {
        if (!window.confirm("Excluir este cartão?")) return;
        try {
            await api.delete(`/cartoes/${id}`);
            await carregarCartoes();
            alert('Cartão excluído!');
        } catch (error: unknown) {
            console.error("Erro ao excluir:", error);
            alert('Erro ao excluir cartão');
        }
    };

    // Cor do cartão
    const obterCorCartao = (banco?: string) => {
        if (!banco) return 'bg-slate-900 border border-slate-800 opacity-50';
        const b = banco.toLowerCase();
        if (b.includes('ita')) return 'bg-gradient-to-br from-orange-500 to-orange-600';
        if (b.includes('amex') || b.includes('american')) return 'bg-gradient-to-br from-emerald-500 to-teal-700';
        if (b.includes('nubank')) return 'bg-gradient-to-br from-purple-600 to-indigo-900';
        if (b.includes('bradesco')) return 'bg-gradient-to-br from-red-600 to-red-800';
        if (b.includes('santander')) return 'bg-gradient-to-br from-red-500 to-slate-900';
        return 'bg-gradient-to-br from-indigo-600 to-purple-800';
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-slate-500 hover:text-white mb-8"
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

                        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                            {fetching ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="animate-spin text-indigo-500" />
                                    <span className="ml-2">Carregando...</span>
                                </div>
                            ) : cartoes.length > 0 ? (
                                cartoes.map(cartao => (
                                    <div key={cartao.id} className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-indigo-400">
                                                    <CreditCard size={24} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg">{cartao.nomeCartao}</p>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className="text-xs bg-slate-800 px-2 py-1 rounded">
                                                            {cartao.bandeira}
                                                        </span>
                                                        <span className="text-xs bg-indigo-900/50 px-2 py-1 rounded">
                                                            {cartao.multiplicadorPontos?.toFixed(1)}x
                                                        </span>
                                                        {cartao.programaDoUsuario?.programaCatalogo?.nome && (
                                                            <span className="text-xs bg-emerald-900/50 px-2 py-1 rounded">
                                                                {cartao.programaDoUsuario.programaCatalogo.nome}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleExcluir(cartao.id)}
                                                className="text-slate-600 hover:text-red-400 p-2"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        {cartao.programaDoUsuario && (
                                            <div className="mt-3 text-xs text-slate-500">
                                                Saldo: {cartao.programaDoUsuario.saldoPontos} pontos
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-3xl">
                                    <Wallet className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                    <p className="text-slate-500">Nenhum cartão cadastrado</p>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Os cartões salvos aparecerão aqui
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Formulário */}
                    <div className="lg:col-span-7 bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-6 md:p-10">
                        <div className="flex flex-col xl:flex-row gap-10">
                            
                            <div className="flex-1 space-y-6">
                                <h3 className="text-xl font-bold text-indigo-400">NOVO CARTÃO</h3>
                                <form onSubmit={handleSalvar} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">
                                            Número do Cartão
                                        </label>
                                        <input
                                            required
                                            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none focus:border-indigo-500 text-white font-mono"
                                            placeholder="0000 0000 0000 0000"
                                            value={numeroCartao}
                                            maxLength={19}
                                            onChange={handleNumeroCartaoChange}
                                        />
                                        {erroBin && (
                                            <p className="text-xs text-amber-500">{erroBin}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">
                                            Apelido do Cartão
                                        </label>
                                        <input
                                            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none focus:border-indigo-500 text-white"
                                            placeholder="Ex: Cartão Principal"
                                            value={nomePersonalizado}
                                            onChange={e => setNomePersonalizado(e.target.value)}
                                        />
                                    </div>

                                    {dadosDetectados && (
                                        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                                            <p className="text-indigo-400 text-xs uppercase font-bold mb-1">
                                                IDENTIFICAÇÃO AUTOMÁTICA
                                            </p>
                                            <p className="text-white font-bold">{dadosDetectados.nomeExibicao}</p>
                                            <p className="text-slate-500 text-xs uppercase">
                                                {dadosDetectados.bandeira} • {dadosDetectados.multiplicadorPadrao} PTS/$
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={!dadosDetectados || loading}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 p-4 rounded-2xl font-bold flex justify-center items-center gap-2 text-white disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="animate-spin" />
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
                                <div className={`w-80 h-48 rounded-2xl p-6 flex flex-col justify-between shadow-2xl ${obterCorCartao(dadosDetectados?.banco)}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-9 bg-yellow-200/40 rounded-lg border border-white/20 flex items-center justify-center">
                                            <div className="w-8 h-6 border border-black/10 rounded-sm" />
                                        </div>
                                        <span className="text-white/30 tracking-[0.3em] uppercase text-[9px]">
                                            {dadosDetectados?.bandeira || "NETWORK"}
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-lg font-mono tracking-[0.18em] text-white/90">
                                            {formatarParaExibicao(numeroCartao)}
                                        </p>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[8px] text-white/40 uppercase">Titular</p>
                                                <p className="text-[10px] text-white font-bold uppercase truncate max-w-35">
                                                    {nomePersonalizado || dadosDetectados?.nomeExibicao || "Aguardando..."}
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