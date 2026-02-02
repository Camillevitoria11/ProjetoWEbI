// RegistrarCompra.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Save, Loader2 } from 'lucide-react';
import api from '../services/api';

interface Cartao {
    id: number;
    nomeCartao: string;
    bandeira: string;
    multiplicadorPontos: number | null;
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

export function RegistrarCompra() {
    const navigate = useNavigate();
    const [cartoes, setCartoes] = useState<Cartao[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingCartoes, setLoadingCartoes] = useState(true);
    const [sucesso, setSucesso] = useState(false);
    
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [cartaoId, setCartaoId] = useState('');
    const [arquivo, setArquivo] = useState<File | null>(null);
    const [erro, setErro] = useState<string>('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const carregarCartoes = async () => {
            setLoadingCartoes(true);
            try {
                const response = await api.get('/cartoes');
                const cartoesComMultiplicador = response.data.map((cartao: Cartao) => ({
                    ...cartao,
                    multiplicadorPontos: cartao.multiplicadorPontos || 1
                }));
                setCartoes(cartoesComMultiplicador);
                
                if (cartoesComMultiplicador.length > 0) {
                    setCartaoId(cartoesComMultiplicador[0].id.toString());
                }
            } catch (error: unknown) {
                const apiError = error as ApiError;
                if (apiError.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } finally {
                setLoadingCartoes(false);
            }
        };
        
        carregarCartoes();
    }, [navigate]);

    // Efeito para redirecionar após sucesso
    useEffect(() => {
        if (sucesso) {
            const timer = setTimeout(() => {
                navigate('/dashboard');
            }, 1500); // 1.5 segundos antes de redirecionar
            
            return () => clearTimeout(timer);
        }
    }, [sucesso, navigate]);

    const formatarValor = (valor: string) => {
        return valor.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
    };

    const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValor(formatarValor(e.target.value));
        setErro('');
    };

    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro('');
        
        if (!descricao.trim()) {
            setErro('Informe a descrição da compra');
            return;
        }
        
        const valorNumerico = parseFloat(valor);
        if (!valor || isNaN(valorNumerico) || valorNumerico <= 0) {
            setErro('Informe um valor válido maior que zero');
            return;
        }
        
        if (!cartaoId) {
            setErro('Selecione um cartão');
            return;
        }

        setLoading(true);

        try {
            const dadosCompra = {
                descricao: descricao.trim(),
                valor: valorNumerico,
                cartaoId: parseInt(cartaoId, 10)
            };

            const formData = new FormData();
            formData.append('dados', new Blob([JSON.stringify(dadosCompra)], {
                type: 'application/json'
            }));
            
            if (arquivo) {
                formData.append('comprovante', arquivo);
            } else {
                formData.append('comprovante', new Blob([]));
            }
            
            await api.post('/compras/registrar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // Marca como sucesso para mostrar mensagem e redirecionar
            setSucesso(true);
            
        } catch (error: unknown) {
            const apiError = error as ApiError;
            let mensagemErro = 'Erro ao registrar compra';
            
            if (apiError.response) {
                if (apiError.response.status === 401) {
                    mensagemErro = 'Sessão expirada. Faça login novamente.';
                    localStorage.removeItem('token');
                    setTimeout(() => navigate('/login'), 1000);
                } else if (apiError.response.status === 400) {
                    mensagemErro = apiError.response.data?.message || 'Dados inválidos';
                }
            }
            
            setErro(mensagemErro);
            setLoading(false);
        }
    };

    const handleArquivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        
        if (file) {
            const maxSize = 5 * 1024 * 1024;
            const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            
            if (file.size > maxSize) {
                setErro('Arquivo muito grande. Tamanho máximo: 5MB');
                return;
            }
            
            if (!tiposPermitidos.includes(file.type)) {
                setErro('Tipo de arquivo não permitido. Use JPG, PNG ou PDF.');
                return;
            }
        }
        
        setArquivo(file);
        setErro('');
    };

    const handleCartaoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCartaoId(e.target.value);
        setErro('');
    };

    const handleDescricaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDescricao(e.target.value);
        setErro('');
    };

    if (loadingCartoes && cartoes.length === 0) {
        return (
            <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex justify-center items-center">
                <div className="w-full max-w-2xl bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
                    >
                        <ArrowLeft size={20} /> Voltar para Dashboard
                    </button>
                    
                    <div className="text-center py-12">
                        <Loader2 className="animate-spin text-indigo-500 w-12 h-12 mx-auto mb-4" />
                        <p className="text-slate-400">Carregando seus cartões...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Tela de sucesso
    if (sucesso) {
        return (
            <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex justify-center items-start">
                <div className="w-full max-w-2xl bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm mt-8">
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-emerald-400 mb-4">Compra registrada com sucesso!</h3>
                        <p className="text-slate-400 mb-8">Redirecionando para a dashboard em instantes...</p>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const cartaoSelecionado = cartoes.find(c => c.id.toString() === cartaoId);
    const multiplicador = cartaoSelecionado?.multiplicadorPontos || 1;
    const valorNumerico = valor ? parseFloat(valor) : 0;
    const pontosEstimados = valorNumerico > 0 ? Math.round(valorNumerico * multiplicador) : 0;

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex justify-center items-start">
            <div className="w-full max-w-2xl bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm mt-8">
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft size={20} /> Voltar para Dashboard
                </button>

                <h2 className="text-3xl font-bold mb-2 text-indigo-400">
                    Nova Compra
                </h2>
                <p className="text-slate-400 mb-8">Preencha os dados para calcular suas milhas automaticamente.</p>

                {erro && (
                    <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-xl">
                        <p className="text-red-300 text-sm">{erro}</p>
                    </div>
                )}

                <form onSubmit={handleSalvar} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            Descrição da Compra
                        </label>
                        <input
                            required
                            placeholder="Ex: Assinatura Netflix, Supermercado, Restaurante..."
                            className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all hover:border-slate-600"
                            value={descricao}
                            onChange={handleDescricaoChange}
                            maxLength={100}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                Valor (R$)
                            </label>
                            <input
                                required
                                type="text"
                                inputMode="decimal"
                                placeholder="0,00"
                                className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all hover:border-slate-600"
                                value={valor}
                                onChange={handleValorChange}
                                pattern="[0-9]*[.]?[0-9]*"
                            />
                            <p className="text-xs text-slate-500">
                                Use ponto como separador decimal (ex: 49.98)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                Cartão Utilizado
                            </label>
                            <div className="relative">
                                <select
                                    required
                                    disabled={loadingCartoes || cartoes.length === 0}
                                    className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all appearance-none text-white disabled:opacity-50 hover:border-slate-600"
                                    value={cartaoId}
                                    onChange={handleCartaoChange}
                                >
                                    <option value="" className="bg-slate-800">Selecione um cartão</option>
                                    {cartoes.map((c) => (
                                        <option key={c.id} value={c.id} className="bg-slate-800">
                                            {c.nomeCartao} ({c.bandeira} - {(c.multiplicadorPontos || 1).toFixed(1)}x)
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                    </svg>
                                </div>
                            </div>
                            {cartoes.length === 0 && !loadingCartoes && (
                                <p className="text-sm text-amber-400">
                                    Você precisa cadastrar um cartão primeiro.{' '}
                                    <button 
                                        type="button"
                                        onClick={() => navigate('/cartoes')}
                                        className="text-indigo-300 hover:text-indigo-200 underline"
                                    >
                                        Cadastrar cartão
                                    </button>
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Comprovante (Opcional)</label>
                        <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-indigo-500/50 transition-colors relative group">
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleArquivoChange}
                            />
                            <Upload className="mx-auto text-slate-500 mb-2 group-hover:text-indigo-400 transition-colors" />
                            <p className="text-sm text-slate-400">
                                {arquivo ? (
                                    <>
                                        <span className="text-emerald-300">{arquivo.name}</span>
                                        <br />
                                        <span className="text-xs text-slate-500">
                                            ({Math.round(arquivo.size / 1024)} KB)
                                        </span>
                                    </>
                                ) : (
                                    "Clique ou arraste o comprovante até aqui"
                                )}
                            </p>
                            <p className="text-xs text-slate-600 mt-2">
                                PDF, JPG, JPEG ou PNG (máx. 5MB)
                            </p>
                        </div>
                    </div>

                    {cartaoId && valorNumerico > 0 && (
                        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                            <p className="text-sm text-slate-400 mb-2">🎯 Cálculo estimado:</p>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-300">Valor:</span>
                                <span className="font-bold">R$ {valorNumerico.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-slate-300">Multiplicador:</span>
                                <span className="font-bold text-indigo-300">
                                    {multiplicador.toFixed(1)}x
                                </span>
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
                                <span className="text-slate-300">Pontos estimados:</span>
                                <span className="font-bold text-emerald-300">
                                    {pontosEstimados} pts
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="text-sm text-slate-500">
                        <p><span className="text-red-400">*</span> Campos obrigatórios</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 p-4 rounded-xl font-bold transition-all text-center border border-slate-700 hover:border-slate-600"
                        >
                            Cancelar
                        </button>
                        
                        <button
                            type="submit"
                            disabled={loading || loadingCartoes || cartoes.length === 0 || !!erro}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:cursor-not-allowed p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/20"
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
                    </div>
                </form>
            </div>
        </div>
    );
}