import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Save, Loader2 } from 'lucide-react';
import api from '../services/api';

interface Cartao {
    id: number;
    nomeCartao: string;
}

export function RegistrarCompra() {
    const navigate = useNavigate();
    const [cartoes, setCartoes] = useState<Cartao[]>([]);
    const [loading, setLoading] = useState(false);
    
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [cartaoId, setCartaoId] = useState('');
    const [arquivo, setArquivo] = useState<File | null>(null);

    // BUSCA OS CARTÕES: Ajustado para o endpoint padrão que você usa
    useEffect(() => {
        api.get('/cartoes') // Verifique se o endpoint é /cartoes ou /cartoes/usuario
            .then(res => {
                console.log("Cartões recebidos:", res.data);
                setCartoes(res.data);
            })
            .catch(err => console.error("Erro ao buscar cartões", err));
    }, []);

    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        
        const dados = {
            descricao,
            valor: parseFloat(valor),
            cartaoId: Number(cartaoId)
        };

        // Envio como Blob para suportar Multipart no Spring Boot
        formData.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }));
        
        if (arquivo) {
            formData.append('comprovante', arquivo);
        }

        try {
            await api.post('/compras/registrar', formData);
            alert('Compra registrada com sucesso!');
            navigate('/dashboard');
        } catch (error) {
            console.error("Erro ao salvar compra:", error);
            alert('Falha ao registrar compra. Verifique se todos os campos estão preenchidos.');
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
                        <label className="text-sm font-medium text-slate-400">Descrição da Compra</label>
                        <input
                            required
                            placeholder="Ex: Assinatura Streaming, Jantar..."
                            className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 outline-none transition-all"
                            value={descricao}
                            onChange={e => setDescricao(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Valor (R$)</label>
                            <input
                                required
                                type="number" step="0.01"
                                placeholder="0,00"
                                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 outline-none transition-all"
                                value={valor}
                                onChange={e => setValor(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Cartão Utilizado</label>
                            <div className="relative">
                                <select
                                    required
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
                                        <option disabled className="bg-slate-900">Nenhum cartão encontrado</option>
                                    )}
                                </select>
                                {/* Seta customizada para o select */}
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Comprovante (Opcional)</label>
                        <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 text-center hover:border-indigo-500/50 transition-colors relative">
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={e => setArquivo(e.target.files?.[0] || null)}
                            />
                            <Upload className="mx-auto text-slate-600 mb-2" />
                            <p className="text-sm text-slate-500">
                                {arquivo ? arquivo.name : "Selecione ou arraste o comprovante até aqui"}
                            </p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Registrar Compra</>}
                    </button>
                </form>
            </div>
        </div>
    );
}