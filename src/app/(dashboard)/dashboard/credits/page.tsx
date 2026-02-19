'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CreditCard, Clock, CheckCircle, XCircle, Copy, Wallet, ArrowUpRight, ArrowDownLeft, FileText } from 'lucide-react';

export default function CreditsPage() {
    const [balance, setBalance] = useState(0);
    const [requests, setRequests] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>({});
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'requests' | 'transactions'>('requests');

    useEffect(() => {
        fetchData();
        fetchSettings();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resCredits, resPayments] = await Promise.all([
                fetch('/api/credits').then(res => res.json()),
                fetch('/api/payments').then(res => res.json())
            ]);

            if (resCredits.balance !== undefined) setBalance(resCredits.balance);
            if (resCredits.transactions) setTransactions(resCredits.transactions);
            if (Array.isArray(resPayments)) setRequests(resPayments);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        const res = await fetch('/api/settings');
        if (res.ok) setSettings(await res.json());
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: Number(amount) }),
            });

            if (res.ok) {
                setAmount('');
                fetchData();
                alert('Ödeme bildiriminiz alındı. Onaylandığında bakiyeniz eklenecektir.');
            } else {
                alert('Hata oluştu.');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Kopyalandı: ' + text);
    };

    if (loading && balance === 0) return <div className="text-foreground text-center p-10 font-bold">Veriler yükleniyor...</div>;

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-foreground">Bakiye & Finans</h1>
                    <p className="text-gray-500">Kredi yükleyin ve işlem geçmişinizi takip edin.</p>
                </div>
                <Card className="bg-primary p-6 px-8 rounded-3xl text-white shadow-2xl shadow-primary/30 flex items-center gap-6 border-none">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                        <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">Kullanılabilir Bakiye</p>
                        <p className="text-4xl font-black">{balance} <span className="text-lg font-bold opacity-70">CR</span></p>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Bank Info & Form (2 columns wide) */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-8 border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-sm ring-1 ring-gray-100 dark:ring-gray-900 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-2 h-full bg-primary/20"></div>
                            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                                <CreditCard className="w-6 h-6 text-primary" /> Banka Hesap Bilgileri
                            </h2>

                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Alıcı Ünvanı</p>
                                    <p className="font-bold text-foreground truncate">{settings.account_holder || 'Tuning Portal LTD.'}</p>
                                </div>

                                <div
                                    className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 group relative cursor-pointer hover:bg-primary/5 hover:border-primary/20 transition-all"
                                    onClick={() => copyToClipboard(settings.iban || 'TR000...')}
                                >
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">IBAN Numarası</p>
                                    <p className="font-mono font-black text-foreground tracking-tighter text-sm break-all pr-8">
                                        {settings.iban || 'TR00 0000 0000 0000 0000 0000 00'}
                                    </p>
                                    <Copy className="w-4 h-4 text-primary absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>

                                <div className="p-4 rounded-2xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20">
                                    <p className="text-xs text-yellow-700 dark:text-yellow-500 font-medium">
                                        ⚠️ Transfer yaparken açıklama kısmına <strong>Panel E-posta Adresinizi</strong> yazmayı unutmayın.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-8 border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-sm ring-1 ring-gray-100 dark:ring-gray-900">
                            <h2 className="text-xl font-bold text-foreground mb-6">Ödeme Bildirimi Yap</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Transfer Edilen Tutar (CR = TL)</label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            placeholder="1000"
                                            value={amount}
                                            onChange={e => setAmount(e.target.value)}
                                            required
                                            min="1"
                                            className="h-14 pl-12 text-xl font-black bg-gray-50 dark:bg-gray-900 border-none rounded-2xl ring-1 ring-gray-200 dark:ring-gray-800 focus:ring-2 focus:ring-primary"
                                        />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-primary text-lg">₺</div>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20" isLoading={submitting}>
                                    Ödemeyi Bildir
                                </Button>
                                <p className="text-[10px] text-gray-400 text-center uppercase tracking-tighter">
                                    ONAY SÜRESİ YAKLAŞIK 15-60 DAKİKADIR
                                </p>
                            </form>
                        </Card>
                    </div>

                    {/* Spendings and Requests Table */}
                    <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-sm overflow-hidden ring-1 ring-gray-100 dark:ring-gray-900">
                        <div className="p-1 bg-gray-50 dark:bg-gray-900 flex gap-1">
                            <button
                                onClick={() => setActiveTab('requests')}
                                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'requests' ? 'bg-white dark:bg-black shadow-sm text-primary' : 'text-gray-500 hover:text-foreground'}`}
                            >
                                Bakiye Yükleme Talepleri
                            </button>
                            <button
                                onClick={() => setActiveTab('transactions')}
                                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'transactions' ? 'bg-white dark:bg-black shadow-sm text-primary' : 'text-gray-500 hover:text-foreground'}`}
                            >
                                Harcama Geçmişi
                            </button>
                        </div>

                        <div className="p-0">
                            {activeTab === 'requests' ? (
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {requests.length === 0 ? (
                                        <div className="p-10 text-center text-gray-400">
                                            <Clock className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                            <p className="text-sm font-medium">Henüz bir yükleme talebiniz bulunmuyor.</p>
                                        </div>
                                    ) : (
                                        requests.map((req) => (
                                            <div key={req.id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${req.status === 'approved' ? 'bg-green-100 text-green-600' :
                                                            req.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                                                        }`}>
                                                        {req.status === 'approved' ? <CheckCircle className="w-5 h-5" /> : req.status === 'rejected' ? <XCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-foreground">{req.amount} CR</p>
                                                        <p className="text-xs text-gray-500 font-medium">{new Date(req.created_at).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {req.status === 'pending' ? 'İnceleniyor' : req.status === 'approved' ? 'Hesaba Geçti' : 'Reddedildi'}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {transactions.length === 0 ? (
                                        <div className="p-10 text-center text-gray-400">
                                            <FileText className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                            <p className="text-sm font-medium">Henüz bir işleminiz bulunmuyor.</p>
                                        </div>
                                    ) : (
                                        transactions.map((tx) => (
                                            <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                        {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-foreground">{tx.description}</p>
                                                        <p className="text-xs text-gray-500 font-medium">{new Date(tx.created_at).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <p className={`font-black text-lg ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {tx.type === 'credit' ? '+' : '-'}{Math.abs(tx.amount)} CR
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right: Info Panels */}
                <div className="space-y-8">
                    <Card className="p-8 border-none bg-gradient-to-br from-gray-900 to-black text-white shadow-2xl overflow-hidden relative group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors"></div>
                        <h3 className="text-xl font-black mb-4 relative z-10 text-primary uppercase italic">Premium Tuner System</h3>
                        <p className="text-sm text-gray-400 leading-relaxed mb-6 relative z-10">
                            Sistemimiz kredi bazlı çalışmaktadır. Yüklediğiniz her kredi anında hesabınıza tanımlanır ve taleplerinizde kullanılabilir.
                            Geri iadeler aynı şekilde kredi olarak tanımlanmaktadır.
                        </p>
                        <ul className="space-y-3 relative z-10">
                            <li className="flex items-start gap-2 text-xs">
                                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                                <span>Dosya başına şeffaf fiyatlandırma</span>
                            </li>
                            <li className="flex items-start gap-2 text-xs">
                                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                                <span>7/24 Bakiye kullanımı</span>
                            </li>
                            <li className="flex items-start gap-2 text-xs">
                                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                                <span>Güvenli Havale/EFT altyapısı</span>
                            </li>
                        </ul>
                    </Card>

                    <Card className="p-8 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 h-fit">
                        <h3 className="font-bold text-foreground mb-4">Yardıma mı ihtiyacınız var?</h3>
                        <p className="text-xs text-gray-500 mb-6">
                            Ödemenizle ilgili bir sorun yaşıyorsanız veya dekont iletmek isterseniz admin panelinden mesaj gönderebilirsiniz.
                        </p>
                        <Button variant="outline" className="w-full" onClick={() => window.location.href = '/dashboard/messages'}>
                            Mesaj Gönder
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
