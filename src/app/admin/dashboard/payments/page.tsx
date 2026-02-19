'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Check, X, CreditCard, Settings } from 'lucide-react';

export default function AdminPaymentsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
        fetchSettings();
    }, []);

    const fetchData = async () => {
        const res = await fetch('/api/payments');
        if (res.ok) setRequests(await res.json());
        setIsLoading(false);
    };

    const fetchSettings = async () => {
        const res = await fetch('/api/settings');
        if (res.ok) setSettings(await res.json());
    };

    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        if (!confirm(`Bu işlemi ${action === 'approve' ? 'onaylamak' : 'reddetmek'} istediğinize emin misiniz?`)) return;

        try {
            const res = await fetch('/api/payments/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action }),
            });

            if (res.ok) {
                fetchData(); // Refresh list
            } else {
                alert('İşlem başarısız.');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData);

        const res = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (res.ok) {
            alert('Ayarlar kaydedildi.');
            fetchSettings();
        }
    };

    if (isLoading) return <div className="text-foreground p-8">Yükleniyor...</div>;

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const pastRequests = requests.filter(r => r.status !== 'pending');

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-foreground">Ödeme Yönetimi</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Requests */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Pending */}
                    <Card className="p-6 border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-foreground">Bekleyen Ödemeler</h2>
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold">{pendingRequests.length}</span>
                        </div>

                        <div className="space-y-4">
                            {pendingRequests.length === 0 ? (
                                <p className="text-gray-500 text-sm">Bekleyen ödeme talebi yok.</p>
                            ) : (
                                pendingRequests.map((req) => (
                                    <div key={req.id} className="flex flex-col md:flex-row items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-lg text-foreground">{req.amount} TL</span>
                                                <span className="text-xs text-gray-500">#{req.id}</span>
                                            </div>
                                            <p className="text-sm font-medium text-foreground">{req.user_name}</p>
                                            <p className="text-xs text-gray-500">{req.company_name} • {new Date(req.created_at).toLocaleString()}</p>
                                        </div>
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <Button size="sm" variant="danger" className="flex-1 md:flex-none" onClick={() => handleAction(req.id, 'reject')}>
                                                <X className="w-4 h-4 mr-1" /> Red
                                            </Button>
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white flex-1 md:flex-none" onClick={() => handleAction(req.id, 'approve')}>
                                                <Check className="w-4 h-4 mr-1" /> Onayla
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    {/* History */}
                    <Card className="p-6 border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                        <h2 className="text-xl font-bold text-foreground mb-4">Geçmiş İşlemler</h2>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {pastRequests.map((req) => (
                                <div key={req.id} className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-gray-900 text-sm">
                                    <div>
                                        <span className="font-bold text-foreground">{req.user_name}</span>
                                        <span className="text-gray-500 mx-2">{req.amount} TL</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${req.status === 'approved' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                                        }`}>{req.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Right: Settings */}
                <Card className="p-6 border-gray-200 dark:border-gray-800 bg-white dark:bg-black h-fit">
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5" /> Hesap Ayarları
                    </h2>
                    <form onSubmit={handleSaveSettings} className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-500 block mb-1">Hesap Sahibi</label>
                            <Input name="account_holder" defaultValue={settings.account_holder} />
                        </div>
                        <div>
                            <label className="text-sm text-gray-500 block mb-1">IBAN</label>
                            <Input name="iban" defaultValue={settings.iban} />
                        </div>
                        <Button type="submit" variant="secondary" className="w-full">
                            Ayarları Kaydet
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
