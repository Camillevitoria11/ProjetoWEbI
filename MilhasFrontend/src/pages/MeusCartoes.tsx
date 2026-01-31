import { useState, useEffect, useCallback } from 'react';
import { CreditCard, Save, Loader2, ArrowLeft, Trash2, Wallet } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface CartaoCadastrado {
    id: number;
    nomeCartao: string;
    bandeira: string;
    multiplicadorPontos: number;
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
    
    // Estados
    const [cartoes, setCartoes] = useState<CartaoCadastrado[]>([]);
    const [numeroCartao, setNumeroCartao] = useState('');
    const [nomePersonalizado, setNomePersonalizado] = useState('');
    const [dadosDetectados, setDadosDetectados] = useState<CatalogoResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Formatação de exibição do cartão (0000 0000...)
    const formatarParaExibicao = (valor: string) => {
        const apenasNumeros = valor.replace(/\D/g, '').padEnd(16, '•');
        return apenasNumeros.replace(/(.{4})/g, '$1 ').trim();
    };

    // Busca cartões do usuário
    const carregarCartoes = useCallback(async () => {
        try {
            setFetching(true);
            const res = await api.get('/cartoes');
            setCartoes(res.data);
        } catch (err) {
            console.error("Erro ao carregar cartões:", err);
        } finally {
            setFetching(false);
        }
    }, []);

    useEffect(() => {
        carregarCartoes();
    }, [carregarCartoes]);

    // Identificação de BIN automática
    useEffect(() => {
        const algarismos = numeroCartao.replace(/\D/g, '');
        if (algarismos.length >= 6) {
            const bin = algarismos.substring(0, 6);
            api.get(`/cartoes/identificar/${bin}`)
                .then(res => setDadosDetectados(res.data))
                .catch(() => setDadosDetectados(null));
        } else {
            setDadosDetectados(null);
        }
    }, [numeroCartao]);

    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!dadosDetectados) return;

        setLoading(true);
        try {
            await api.post('/cartoes', {
                nomeCartao: nomePersonalizado.trim() || dadosDetectados.nomeExibicao,
                bandeira: dadosDetectados.bandeira,
                multiplicadorPontos: dadosDetectados.multiplicadorPadrao,
            });
            
            // Reset de campos
            setNumeroCartao('');
            setNomePersonalizado('');
            setDadosDetectados(null);
            carregarCartoes();
        } catch (err) {
            console.error("Erro ao salvar:", err);
            alert("Erro ao salvar cartão.");
        } finally {
            setLoading(false);
        }
    };

    const handleExcluir = async (id: number) => {
        if (!window.confirm("Deseja realmente excluir este cartão?")) return;
        
        try {
            await api.delete(`/cartoes/${id}`);
            setCartoes(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error("Erro ao excluir:", err);
            alert("Falha ao excluir o cartão.");
        }
    };

    // Estilização dinâmica baseada no banco
    const obterCorCartao = (banco?: string) => {
        if (!banco) return 'bg-slate-900 border border-slate-800 opacity-50';
        const b = banco.toLowerCase();
        if (b.includes('ita')) return 'bg-linear-to-br from-orange-500 to-orange-600 shadow-orange-500/20';
        if (b.includes('amex') || b.includes('american')) return 'bg-linear-to-br from-emerald-500 to-teal-700 shadow-emerald-500/20';
        if (b.includes('nubank')) return 'bg-linear-to-br from-purple-600 to-indigo-900 shadow-purple-500/20';
        if (b.includes('bradesco')) return 'bg-linear-to-br from-red-600 to-red-800 shadow-red-500/20';
        if (b.includes('santander')) return 'bg-linear-to-br from-red-500 to-slate-900 shadow-red-500/20';
        return 'bg-linear-to-br from-indigo-600 to-purple-800';
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <button 
                    onClick={() => navigate('/dashboard')} 
                    className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
                    Voltar para Dashboard
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Lista de Cartões (Lado Esquerdo) */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <Wallet className="text-indigo-500" />
                            <h2 className="text-2xl font-bold uppercase tracking-tight font-prosto">Meus Cartões</h2>
                        </div>

                        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                            {fetching ? (
                                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-500" /></div>
                            ) : cartoes.length > 0 ? (
                                cartoes.map(cartao => (
                                    <div key={cartao.id} className="group bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex items-center justify-between hover:border-slate-700 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                                <CreditCard size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-200">{cartao.nomeCartao}</p>
                                                <p className="text-xs text-slate-500 uppercase tracking-widest font-medium">
                                                    {cartao.bandeira} • {cartao.multiplicadorPontos.toFixed(1)} PTS/$
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleExcluir(cartao.id)}
                                            className="p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 text-center py-10 border border-dashed border-slate-800 rounded-2xl">
                                    Nenhum cartão cadastrado.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Formulário e Preview (Lado Direito) */}
                    <div className="lg:col-span-7 bg-slate-900/20 border border-slate-800/50 rounded-4xl p-6 md:p-10">
                        <div className="flex flex-col xl:flex-row gap-10">
                            
                            <div className="flex-1 space-y-6">
                                <h3 className="text-xl font-bold font-prosto">NOVO CARTÃO</h3>
                                <form onSubmit={handleSalvar} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">NÚMERO DO CARTÃO (BIN)</label>
                                        <input
                                            required
                                            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all text-white font-mono"
                                            placeholder="Digite os primeiros 6 dígitos..."
                                            value={numeroCartao}
                                            maxLength={16}
                                            onChange={e => setNumeroCartao(e.target.value.replace(/\D/g, ''))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">APELIDO DO CARTÃO</label>
                                        <input
                                            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all text-white"
                                            placeholder="Ex: Nubank Platinum"
                                            value={nomePersonalizado}
                                            onChange={e => setNomePersonalizado(e.target.value)}
                                        />
                                    </div>

                                    {dadosDetectados && (
                                        <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl animate-in fade-in slide-in-from-top-2">
                                            <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1">Detectado via BIN:</p>
                                            <p className="text-white font-bold">{dadosDetectados.nomeExibicao}</p>
                                            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-medium">
                                                {dadosDetectados.bandeira} • {dadosDetectados.multiplicadorPadrao} PTS/DÓLAR
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={!dadosDetectados || loading}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 p-4 rounded-2xl font-bold flex justify-center items-center gap-2 transition-all text-white shadow-lg shadow-indigo-600/20 active:scale-95 mt-4 uppercase tracking-widest"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Confirmar Cartão</>}
                                    </button>
                                </form>
                            </div>

                            {/* Cartão Visual */}
                            <div className="flex items-center justify-center">
                                <div className={`w-80 h-48 rounded-2xl p-6 flex flex-col justify-between shadow-2xl transition-all duration-500 hover:rotate-2 ${obterCorCartao(dadosDetectados?.banco)}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="w-10 h-8 bg-white/10 rounded-md backdrop-blur-md border border-white/10 flex items-center justify-center">
                                            <div className="w-6 h-4 bg-yellow-500/20 border border-yellow-500/40 rounded-sm" />
                                        </div>
                                        <span className="text-white/40 tracking-widest uppercase font-black text-[10px]">
                                            {dadosDetectados?.bandeira || "NETWORK"}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-lg font-mono tracking-[0.15em] text-white/90">
                                            {formatarParaExibicao(numeroCartao)}
                                        </p>
                                        <div className="flex flex-col">
                                            <p className="text-[9px] text-white/40 uppercase font-bold tracking-tighter">NOME NO CARTÃO</p>
                                            <p className="text-[11px] text-white/80 uppercase font-bold truncate max-w-50">
                                                {nomePersonalizado || dadosDetectados?.nomeExibicao || "Aguardando BIN..."}
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
    );
}