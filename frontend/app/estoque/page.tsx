'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArgonLayout from '@/components/Argon/ArgonLayout';
import {
    Package,
    Plus,
    Search,
    AlertTriangle,
    TrendingDown,
    TrendingUp,
    RefreshCw,
    Filter,
    Edit,
    Trash2,
    ArrowDown,
    ArrowUp,
    Box
} from 'lucide-react';

interface InventoryItem {
    id: number;
    name: string;
    description?: string;
    category?: number;
    category_name?: string;
    quantity: number;
    min_quantity: number;
    unit_display: string;
    stock_status: string;
    is_active: boolean;
}

interface InventoryCategory {
    id: number;
    name: string;
    color: string;
    items_count: number;
}

interface InventoryStats {
    total_items: number;
    low_stock: number;
    out_of_stock: number;
    normal: number;
}

export default function EstoquePage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [categories, setCategories] = useState<InventoryCategory[]>([]);
    const [stats, setStats] = useState<InventoryStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [stockFilter, setStockFilter] = useState<string>('all');
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [transactionType, setTransactionType] = useState<'ENTRADA' | 'SAIDA'>('ENTRADA');

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            router.push('/welcome');
            return;
        }
        const userData = JSON.parse(user);
        if (userData.user_type !== 'GESTOR') {
            router.push('/dashboard');
            return;
        }
        setCurrentUser(userData);
    }, [router]);

    useEffect(() => {
        if (currentUser) {
            fetchItems();
            fetchCategories();
            fetchStats();
        }
    }, [currentUser, selectedCategory, stockFilter]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            let url = 'http://localhost:8000/api/estoque/items/';
            const params = new URLSearchParams();

            if (selectedCategory) {
                params.append('category', selectedCategory.toString());
            }
            if (stockFilter === 'low') {
                params.append('stock_status', 'low');
            } else if (stockFilter === 'out') {
                params.append('stock_status', 'out');
            }

            if (params.toString()) {
                url += '?' + params.toString();
            }

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setItems(data.results || data);
            }
        } catch (error) {
            console.error('Erro ao buscar itens:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/estoque/categories/');
            if (response.ok) {
                const data = await response.json();
                setCategories(data.results || data);
            }
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/estoque/items/stats/');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
        }
    };

    const handleTransaction = async (itemId: number, type: 'ENTRADA' | 'SAIDA', quantity: number) => {
        try {
            const response = await fetch('http://localhost:8000/api/estoque/transactions/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    item: itemId,
                    transaction_type: type,
                    quantity: quantity,
                    notes: type === 'ENTRADA' ? 'Entrada de estoque' : 'Saída de estoque'
                })
            });
            if (response.ok) {
                fetchItems();
                fetchStats();
                setShowTransactionModal(false);
                setSelectedItem(null);
            }
        } catch (error) {
            console.error('Erro na transação:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'NORMAL':
                return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Normal</span>;
            case 'BAIXO':
                return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Baixo</span>;
            case 'ESGOTADO':
                return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Esgotado</span>;
            default:
                return null;
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!currentUser) {
        return (
            <ArgonLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <p className="font-medium">Verificando permissões...</p>
                </div>
            </ArgonLayout>
        );
    }

    return (
        <ArgonLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Package className="w-7 h-7 text-teal-500" />
                            Gestão de Estoque
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Controle de materiais e insumos da clínica
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => { fetchItems(); fetchStats(); }}
                            className="p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                            title="Atualizar"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all shadow-md"
                        >
                            <Plus className="w-4 h-4" />
                            Novo Item
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Box className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Total de Itens</p>
                                    <p className="text-2xl font-semibold text-slate-900 dark:text-white">{stats.total_items}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Estoque Normal</p>
                                    <p className="text-2xl font-semibold text-green-600">{stats.normal}</p>
                                </div>
                            </div>
                        </div>

                        <div
                            className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-yellow-300"
                            onClick={() => setStockFilter(stockFilter === 'low' ? 'all' : 'low')}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                    <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Estoque Baixo</p>
                                    <p className="text-2xl font-semibold text-yellow-600">{stats.low_stock}</p>
                                </div>
                            </div>
                        </div>

                        <div
                            className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-red-300"
                            onClick={() => setStockFilter(stockFilter === 'out' ? 'all' : 'out')}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                    <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Esgotados</p>
                                    <p className="text-2xl font-semibold text-red-600">{stats.out_of_stock}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar item..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <select
                                value={selectedCategory || ''}
                                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                            >
                                <option value="">Todas as Categorias</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Stock Status Filter */}
                        <div className="flex items-center gap-2">
                            <select
                                value={stockFilter}
                                onChange={(e) => setStockFilter(e.target.value)}
                                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                            >
                                <option value="all">Todos os Status</option>
                                <option value="low">Estoque Baixo</option>
                                <option value="out">Esgotados</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Items List */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-slate-500">
                            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin" />
                            <p>Carregando estoque...</p>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                            <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium">Nenhum item encontrado</p>
                            <p className="text-sm mt-1">Adicione itens ao estoque</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-700/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Item</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categoria</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quantidade</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mín.</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {filteredItems.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                {item.category_name || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-semibold text-slate-900 dark:text-white">
                                                    {item.quantity} {item.unit_display}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm text-slate-500">
                                                {item.min_quantity}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {getStatusBadge(item.stock_status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedItem(item);
                                                            setTransactionType('ENTRADA');
                                                            setShowTransactionModal(true);
                                                        }}
                                                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg"
                                                        title="Entrada"
                                                    >
                                                        <ArrowDown className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedItem(item);
                                                            setTransactionType('SAIDA');
                                                            setShowTransactionModal(true);
                                                        }}
                                                        className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg"
                                                        title="Saída"
                                                    >
                                                        <ArrowUp className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Transaction Modal */}
                {showTransactionModal && selectedItem && (
                    <TransactionModal
                        item={selectedItem}
                        type={transactionType}
                        onClose={() => { setShowTransactionModal(false); setSelectedItem(null); }}
                        onConfirm={(quantity) => handleTransaction(selectedItem.id, transactionType, quantity)}
                    />
                )}
            </div>
        </ArgonLayout>
    );
}

// Modal de Transação
function TransactionModal({
    item,
    type,
    onClose,
    onConfirm
}: {
    item: InventoryItem;
    type: 'ENTRADA' | 'SAIDA';
    onClose: () => void;
    onConfirm: (quantity: number) => void;
}) {
    const [quantity, setQuantity] = useState(1);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    {type === 'ENTRADA' ? (
                        <>
                            <ArrowDown className="w-5 h-5 text-green-500" />
                            Entrada de Estoque
                        </>
                    ) : (
                        <>
                            <ArrowUp className="w-5 h-5 text-orange-500" />
                            Saída de Estoque
                        </>
                    )}
                </h3>

                <div className="mb-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Item</p>
                    <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-slate-500">Estoque atual: {item.quantity} {item.unit_display}</p>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Quantidade
                    </label>
                    <input
                        type="number"
                        min="1"
                        max={type === 'SAIDA' ? item.quantity : 9999}
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-lg text-center"
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm(quantity)}
                        disabled={quantity <= 0 || (type === 'SAIDA' && quantity > item.quantity)}
                        className={`flex-1 px-4 py-2 rounded-lg text-white font-medium ${type === 'ENTRADA'
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-orange-500 hover:bg-orange-600'
                            } disabled:opacity-50`}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}
