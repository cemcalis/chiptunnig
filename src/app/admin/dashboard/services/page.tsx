'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DollarSign, Plus, Edit3, Trash2, Check, X, Tag, ToggleLeft, ToggleRight } from 'lucide-react';

interface Service {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    is_active: number;
}

const CATEGORIES = [
    { value: 'performans', label: 'Performans' },
    { value: 'emisyon', label: 'Emisyon' },
    { value: 'guvenlik', label: 'Güvenlik' },
    { value: 'sorgulama', label: 'Sorgulama' },
    { value: 'diger', label: 'Diğer' },
    { value: 'genel', label: 'Genel' },
];

const groupByCategory = (services: Service[]) => {
    return services.reduce((acc: Record<string, Service[]>, svc) => {
        const cat = svc.category || 'genel';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(svc);
        return acc;
    }, {});
};

export default function AdminServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | 'new' | null>(null);
    const [editData, setEditData] = useState<Partial<Service>>({});
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    useEffect(() => { fetchServices(); }, []);

    const fetchServices = async () => {
        setLoading(true);
        const res = await fetch('/api/services');
        if (res.ok) setServices(await res.json());
        setLoading(false);
    };

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3000);
    };

    const startNew = () => {
        setEditingId('new');
        setEditData({ name: '', description: '', price: 0, category: 'genel', is_active: 1 });
    };

    const startEdit = (svc: Service) => {
        setEditingId(svc.id);
        setEditData({ ...svc });
    };

    const handleSave = async () => {
        if (!editData.name || editData.price === undefined) {
            showToast('error', 'Servis adı ve fiyatı zorunludur.');
            return;
        }

        try {
            let res: Response;
            if (editingId === 'new') {
                res = await fetch('/api/services', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editData),
                });
            } else {
                res = await fetch(`/api/services/${editingId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editData),
                });
            }

            if (res.ok) {
                showToast('success', editingId === 'new' ? 'Servis eklendi.' : 'Servis güncellendi.');
                setEditingId(null);
                fetchServices();
            } else {
                showToast('error', 'İşlem başarısız.');
            }
        } catch {
            showToast('error', 'Bağlantı hatası.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bu servisi silmek istediğinize emin misiniz?')) return;
        const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('success', 'Servis silindi.');
            fetchServices();
        } else {
            showToast('error', 'Silme başarısız.');
        }
    };

    const handleToggleActive = async (svc: Service) => {
        const res = await fetch(`/api/services/${svc.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: svc.is_active ? 0 : 1 }),
        });
        if (res.ok) fetchServices();
    };

    const grouped = groupByCategory(services);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${toast.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                    }`}>
                    {toast.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Hizmet Fiyatları</h1>
                    <p className="text-gray-500 mt-1">Hizmetlerinizi ve fiyatlarını yönetin.</p>
                </div>
                <button
                    onClick={startNew}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium text-sm transition-colors"
                >
                    <Plus className="w-4 h-4" /> Yeni Hizmet Ekle
                </button>
            </div>

            {/* Add New Form */}
            {editingId === 'new' && (
                <Card className="p-6 border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/10">
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-blue-500" /> Yeni Hizmet
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-500 font-medium block mb-1.5">Hizmet Adı *</label>
                            <input
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                placeholder="DPF Off"
                                value={editData.name || ''}
                                onChange={e => setEditData(p => ({ ...p, name: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 font-medium block mb-1.5">Fiyat (₺) *</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                placeholder="50"
                                value={editData.price === undefined ? '' : editData.price}
                                onChange={e => setEditData(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 font-medium block mb-1.5">Kategori</label>
                            <select
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                value={editData.category || 'genel'}
                                onChange={e => setEditData(p => ({ ...p, category: e.target.value }))}
                            >
                                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 font-medium block mb-1.5">Açıklama</label>
                            <input
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                placeholder="Kısa açıklama..."
                                value={editData.description || ''}
                                onChange={e => setEditData(p => ({ ...p, description: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            İptal
                        </button>
                        <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors flex items-center gap-1.5">
                            <Check className="w-4 h-4" /> Kaydet
                        </button>
                    </div>
                </Card>
            )}

            {/* Services grouped by category */}
            {Object.entries(grouped).map(([category, svcs]) => (
                <Card key={category} className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 capitalize">
                            {CATEGORIES.find(c => c.value === category)?.label || category}
                        </h3>
                        <span className="ml-auto text-xs text-gray-400">{svcs.length} hizmet</span>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {svcs.map((svc) => (
                            <div key={svc.id} className={`p-5 transition-colors ${!svc.is_active ? 'opacity-50' : ''}`}>
                                {editingId === svc.id ? (
                                    /* Edit mode */
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input
                                            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                            value={editData.name || ''}
                                            onChange={e => setEditData(p => ({ ...p, name: e.target.value }))}
                                            placeholder="Hizmet adı"
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                                value={editData.price === undefined ? '' : editData.price}
                                                onChange={e => setEditData(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                                                placeholder="Fiyat"
                                            />
                                            <select
                                                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                                value={editData.category || 'genel'}
                                                onChange={e => setEditData(p => ({ ...p, category: e.target.value }))}
                                            >
                                                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                            </select>
                                        </div>
                                        <input
                                            className="md:col-span-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                            value={editData.description || ''}
                                            onChange={e => setEditData(p => ({ ...p, description: e.target.value }))}
                                            placeholder="Açıklama"
                                        />
                                        <div className="md:col-span-2 flex gap-2">
                                            <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">İptal</button>
                                            <button onClick={handleSave} className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors flex items-center gap-1">
                                                <Check className="w-3 h-3" /> Kaydet
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* View mode */
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900 dark:text-white">{svc.name}</span>
                                                {!svc.is_active && (
                                                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">Pasif</span>
                                                )}
                                            </div>
                                            {svc.description && (
                                                <p className="text-xs text-gray-500 mt-0.5">{svc.description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-xl">
                                                <DollarSign className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                                <span className="font-bold text-green-700 dark:text-green-400 text-sm">{svc.price} ₺</span>
                                            </div>
                                            <button
                                                onClick={() => handleToggleActive(svc)}
                                                title={svc.is_active ? 'Pasife al' : 'Aktife al'}
                                                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                            >
                                                {svc.is_active ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                                            </button>
                                            <button
                                                onClick={() => startEdit(svc)}
                                                className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(svc.id)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            ))}
        </div>
    );
}
