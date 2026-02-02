import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Save, Loader2 } from 'lucide-react';
import api from '../services/api';

interface Cartao {
    id: number;
    nomeCartao: string;
}

interface ApiError {
    response?: {
        data: {
            message?: string;
            error?: string;
            [key: string]: unknown;
        };
        status: number;
        headers: Record<string, string>;
    };
    request?: XMLHttpRequest;
    message?: string;
    code?: string;
}

export function RegistrarCompra() {
    const navigate = useNavigate();
    const [cartoes, setCartoes] = useState<Cartao[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingCartoes, setLoadingCartoes] = useState(true);
    
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [cartaoId, setCartaoId] = useState('');
    const [arquivo, setArquivo] = useState<File | null>(null);

    // BUSCA OS CARTÕES
    useEffect(() => {
        setLoadingCartoes(true);
        api.get('/cartoes')
            .then(res => {
                console.log("Cartões recebidos:", res.data);
                setCartoes(res.data);
            })
            .catch((err: unknown) => {
                console.error("Erro ao buscar cartões", err);
                const apiError = err as ApiError;
                if (apiError.response?.status === 401 || apiError.response?.status === 403) {
                    alert('Sessão expirada. Faça login novamente.');
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            })
            .finally(() => {
                setLoadingCartoes(false);
            });
    }, [navigate]);

    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // VALIDAÇÃO BÁSICA
        if (!descricao.trim()) {
            alert('Informe a descrição da compra');
            return;
        }
        
        const valorNumerico = parseFloat(valor);
        if (!valor || isNaN(valorNumerico) || valorNumerico <= 0) {
            alert('Informe um valor válido maior que zero');
            return;
        }
        
        if (!cartaoId) {
            alert('Selecione um cartão');
            return;
        }

        setLoading(true);

        try {
            const dadosCompra = {
                descricao: descricao.trim(),
                valor: valorNumerico,
                cartaoId: parseInt(cartaoId)
            };

            console.log('Enviando compra:', dadosCompra);
            console.log('Token atual:', localStorage.getItem('token'));

            const response = await api.post('/compras', dadosCompra);
            
            console.log('Resposta da API:', response.data);
            alert('Compra registrada com sucesso!');
            
            // Limpa o formulário após sucesso
            setDescricao('');
            setValor('');
            setCartaoId('');
            setArquivo(null);
            
        } catch (error: unknown) {
            console.error("Erro completo:", error);
            
            // Tratamento de erro tipado sem 'any'
            const apiError = error as ApiError;
            
            if (apiError.response) {
                console.error('Status:', apiError.response.status);
                console.error('Dados do erro:', apiError.response.data);
                
                if (apiError.response.status === 403) {
                    alert('Acesso negado. O token de autenticação pode ter expirado ou ser inválido.');
                    // Limpa o token e redireciona para login
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }
                
                const mensagemErro = apiError.response.data?.message || 
                                   apiError.response.data?.error || 
                                   'Erro ao registrar compra';
                alert(`Erro: ${mensagemErro}`);
            } else if (apiError.request) {
                console.error('Request:', apiError.request);
                alert('Não foi possível conectar ao servidor. Verifique sua conexão.');
            } else if (apiError.message) {
                alert(`Erro: ${apiError.message}`);
            } else {
                alert('Erro ao processar requisição.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex justify-center items-center">
            <div className="w-full max-w-2xl bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft size={20} /> Voltar para Dashboard
                </button>

                <h2 className="text-3xl font-bold mb-2">Nova Compra</h2>
                <p className="text-slate-500 mb-8">Preencha os dados para calcular suas milhas automaticamente.</p>

                <form onSubmit={handleSalvar} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Descrição da Compra *</label>
                        <input
                            required
                            placeholder="Ex: Assinatura Netflix, Supermercado, Restaurante..."
                            className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 outline-none transition-all"
                            value={descricao}
                            onChange={e => setDescricao(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Valor (R$) *</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="0,00"
                                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 outline-none transition-all"
                                value={valor}
                                onChange={e => setValor(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Cartão Utilizado *</label>
                            <div className="relative">
                                <select
                                    required
                                    disabled={loadingCartoes || cartoes.length === 0}
                                    className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 outline-none transition-all appearance-none text-white"
                                    value={cartaoId}
                                    onChange={e => setCartaoId(e.target.value)}
                                >
                                    <option value="" className="bg-slate-900">Selecione um cartão</option>
                                    {cartoes.length > 0 ? (
                                        cartoes.map((c) => (
                                            <option key={c.id} value={c.id} className="bg-slate-900">
                                                {c.nomeCartao}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled className="bg-slate-900">
                                            {loadingCartoes ? 'Carregando cartões...' : 'Nenhum cartão cadastrado'}
                                        </option>
                                    )}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                    </svg>
                                </div>
                            </div>
                            {cartoes.length === 0 && !loadingCartoes && (
                                <p className="text-sm text-amber-500">
                                    Você precisa cadastrar um cartão primeiro.{' '}
                                    <button 
                                        type="button"
                                        onClick={() => navigate('/cadastrar-cartao')}
                                        className="text-indigo-400 hover:text-indigo-300 underline"
                                    >
                                        Cadastrar cartão
                                    </button>
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Comprovante (Opcional)</label>
                        <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 text-center hover:border-indigo-500/50 transition-colors relative">
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={e => setArquivo(e.target.files?.[0] || null)}
                            />
                            <Upload className="mx-auto text-slate-600 mb-2" />
                            <p className="text-sm text-slate-500">
                                {arquivo ? arquivo.name : "Selecione ou arraste o comprovante até aqui"}
                            </p>
                        </div>
                    </div>

                    <div className="text-sm text-slate-500">
                        <p><span className="text-red-500">*</span> Campos obrigatórios</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || loadingCartoes || cartoes.length === 0}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:cursor-not-allowed p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Registrando...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Registrar Compra
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}