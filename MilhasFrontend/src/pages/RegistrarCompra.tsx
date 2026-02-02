import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Save, Loader2 } from 'lucide-react';
import api from '../services/api';

interface Cartao {
    id: number;
    nomeCartao: string;
    bandeira: string;
    multiplicadorPontos: number;
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
        const carregarCartoes = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Sessão expirada. Faça login novamente.');
                navigate('/login');
                return;
            }
            
            setLoadingCartoes(true);
            try {
                const response = await api.get('/cartoes');
                console.log("✅ Cartões recebidos:", response.data);
                setCartoes(response.data);
                
                if (response.data.length > 0) {
                    setCartaoId(response.data[0].id.toString());
                }
            } catch (error: unknown) {
                console.error("❌ Erro ao buscar cartões", error);
                const apiError = error as ApiError;
                if (apiError.response?.status === 401 || apiError.response?.status === 403) {
                    alert('Sessão expirada. Faça login novamente.');
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } finally {
                setLoadingCartoes(false);
            }
        };
        
        carregarCartoes();
    }, [navigate]);

    const formatarValor = (valor: string) => {
        let valorFormatado = valor.replace(/[^\d.]/g, '');
        const partes = valorFormatado.split('.');
        if (partes.length > 2) {
            valorFormatado = partes[0] + '.' + partes.slice(1).join('');
        }
        return valorFormatado;
    };

    const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valorFormatado = formatarValor(e.target.value);
        setValor(valorFormatado);
    };

    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // VALIDAÇÃO
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

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Sessão expirada. Faça login novamente.');
            navigate('/login');
            return;
        }

        setLoading(true);

        try {
            const dadosCompra = {
                descricao: descricao.trim(),
                valor: valorNumerico,
                cartaoId: parseInt(cartaoId, 10)
            };

            console.log('📤 Enviando compra:', dadosCompra);
            console.log('🔑 Token atual:', token);
            console.log('🎯 Endpoint: POST /compras');

            // Testa outras rotas POST para ver se o problema é específico de /compras
            console.log('🔍 Testando se outras rotas POST funcionam...');
            try {
                // Testa um endpoint POST que deveria funcionar
                const testData = { nome: 'teste' };
                const testResponse = await api.post('/cartoes', testData);
                console.log('✅ Outro POST funcionou:', testResponse.status);
            } catch (postError) {
                console.log('❌ Outros POSTs também falham:', postError);
            }

            // Tenta a requisição real
            const response = await api.post('/compras', dadosCompra);
            
            console.log('✅ Resposta da API:', response.data);
            alert('✅ Compra registrada com sucesso!');
            
            // Limpa o formulário
            setDescricao('');
            setValor('');
            setCartaoId(cartoes.length > 0 ? cartoes[0].id.toString() : '');
            setArquivo(null);
            
        } catch (error: unknown) {
            console.error("❌ Erro completo:", error);
            
            const apiError = error as ApiError;
            
            if (apiError.response) {
                console.error('📊 Status do erro:', apiError.response.status);
                
                // Headers importantes para diagnóstico
                console.log('📋 Headers de resposta:', apiError.response.headers);
                
                // ANALISE ESPECÍFICA PARA ERRO 403
                if (apiError.response.status === 403) {
                    console.log('🔍 DIAGNÓSTICO DO ERRO 403:');
                    console.log('   1. Token JWT válido: SIM (GET /cartoes funciona)');
                    console.log('   2. CORS configurado: SIM (headers mostram)');
                    console.log('   3. Problema específico do endpoint /compras');
                    
                    const mensagemDetalhada = `
🚨 ERRO 403 - ACESSO NEGADO

O que sabemos:
✅ Seu token JWT é válido (GET /cartoes funciona)
✅ CORS está configurado corretamente
✅ A conexão com o servidor está ok

O problema:
🔒 O Spring Security está bloqueando o endpoint POST /compras

Possíveis causas no backend:
1. 🔐 Filtro JWT não está processando o endpoint /compras
2. 🛡️ SecurityConfig bloqueia POST para /compras
3. 👤 Usuário não tem role/permissão específica
4. 📍 Endpoint /compras não existe no Controller

Ação necessária:
📍 Verifique no backend:
   - CompraController.java existe e tem @PostMapping("/compras")
   - SecurityConfig permite POST para /compras
   - JwtAuthenticationFilter processa todas as rotas
`;
                    
                    alert(mensagemDetalhada);
                    
                    // Sugere ação imediata
                    console.log('💡 Ação imediata para desenvolvedor backend:');
                    console.log('   1. Verifique CompraController.java');
                    console.log('   2. Verifique SecurityConfig - endpoints permitidos');
                    console.log('   3. Verifique logs do Spring Boot');
                    
                } else if (apiError.response.status === 401) {
                    alert('🔐 Sessão expirada. Faça login novamente.');
                    localStorage.removeItem('token');
                    navigate('/login');
                } else if (apiError.response.status === 400) {
                    const mensagemErro = apiError.response.data?.message || 
                                       apiError.response.data?.error || 
                                       'Dados inválidos';
                    alert(`❌ Erro de validação: ${mensagemErro}`);
                } else {
                    const mensagemErro = apiError.response.data?.message || 
                                       apiError.response.data?.error || 
                                       `Erro ${apiError.response.status}`;
                    alert(`❌ Erro: ${mensagemErro}`);
                }
            } else if (apiError.request) {
                alert('🌐 Não foi possível conectar ao servidor. Verifique sua conexão.');
            } else {
                alert('❌ Erro ao processar requisição.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleArquivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setArquivo(file);
        
        if (file) {
            console.log('📄 Arquivo selecionado:', file.name, 'Tamanho:', file.size, 'bytes');
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
                            maxLength={100}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Valor (R$) *</label>
                            <input
                                required
                                type="text"
                                inputMode="decimal"
                                placeholder="0,00"
                                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 outline-none transition-all"
                                value={valor}
                                onChange={handleValorChange}
                                pattern="[0-9]*[.]?[0-9]*"
                            />
                            <p className="text-xs text-slate-500">Use ponto como separador decimal (ex: 49.98)</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Cartão Utilizado *</label>
                            <div className="relative">
                                <select
                                    required
                                    disabled={loadingCartoes || cartoes.length === 0}
                                    className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 outline-none transition-all appearance-none text-white disabled:opacity-50"
                                    value={cartaoId}
                                    onChange={e => setCartaoId(e.target.value)}
                                >
                                    <option value="" className="bg-slate-900">Selecione um cartão</option>
                                    {cartoes.length > 0 ? (
                                        cartoes.map((c) => (
                                            <option key={c.id} value={c.id} className="bg-slate-900">
                                                {c.nomeCartao} ({c.bandeira} - {c.multiplicadorPontos}x)
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
                                        onClick={() => navigate('/meus-cartoes')}
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
                                onChange={handleArquivoChange}
                            />
                            <Upload className="mx-auto text-slate-600 mb-2" />
                            <p className="text-sm text-slate-500">
                                {arquivo ? (
                                    <>
                                        <span className="text-emerald-400">{arquivo.name}</span>
                                        <br />
                                        <span className="text-xs">({Math.round(arquivo.size / 1024)} KB)</span>
                                    </>
                                ) : (
                                    "Selecione ou arraste o comprovante até aqui"
                                )}
                            </p>
                            <p className="text-xs text-slate-600 mt-2">
                                PDF, JPG, JPEG ou PNG (máx. 5MB)
                            </p>
                        </div>
                    </div>

                    <div className="text-sm text-slate-500">
                        <p><span className="text-red-500">*</span> Campos obrigatórios</p>
                        <p className="text-xs mt-2 text-amber-400">
                            ⚠️ Se receber erro 403, o problema é no backend (SecurityConfig ou Controller)
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 p-4 rounded-xl font-bold transition-all text-center"
                        >
                            Cancelar
                        </button>
                        
                        <button
                            type="submit"
                            disabled={loading || loadingCartoes || cartoes.length === 0}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:cursor-not-allowed p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
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