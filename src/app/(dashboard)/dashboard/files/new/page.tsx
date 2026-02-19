'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { UploadCloud, Check, DollarSign, Wallet, AlertTriangle } from 'lucide-react';

interface Service {
    id: number;
    name: string;
    price: number;
    category: string;
}

export default function NewFilePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [userBalance, setUserBalance] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch services
        fetch('/api/services')
            .then(res => res.json())
            .then(data => setServices(data.filter((s: Service) => s.id))); // Filter active/valid

        // Fetch user balance
        fetch('/api/credits')
            .then(res => res.json())
            .then(data => setUserBalance(data.balance || 0));
    }, []);

    const handleOptionToggle = (optionName: string) => {
        setSelectedOptions((prev) =>
            prev.includes(optionName) ? prev.filter((o) => o !== optionName) : [...prev, optionName]
        );
    };

    const totalCost = selectedOptions.reduce((sum, optName) => {
        const svc = services.find(s => s.name === optName);
        return sum + (svc?.price || 0);
    }, 0);

    const isLowBalance = userBalance < totalCost;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');

        if (isLowBalance) {
            setError('Yetersiz bakiye. Lütfen kredi yükleyin.');
            return;
        }

        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        formData.append('options', JSON.stringify(selectedOptions));

        try {
            const res = await fetch('/api/files', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Yükleme başarısız');

            router.push('/dashboard/files');
            router.refresh();
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    const categories = Array.from(new Set(services.map(s => s.category || 'diğer')));

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Yeni Dosya Talebi</h1>
                    <p className="text-gray-500">Orijinal dosyanızı yükleyin ve istediğiniz işlemleri seçin.</p>
                </div>
                <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 px-4 py-2 rounded-2xl">
                    <Wallet className="w-5 h-5 text-primary" />
                    <div>
                        <p className="text-[10px] uppercase font-bold text-primary/70 leading-none">Mevcut Bakiye</p>
                        <p className="text-lg font-black text-primary">{userBalance} CR</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5" />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Vehicle Info */}
                    <Card className="p-6 space-y-4 border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                        <h2 className="text-xl font-bold text-foreground mb-4">Araç Bilgileri</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Input name="vehicle_make" label="Marka" placeholder="Örn: BMW" required />
                            <Input name="vehicle_model" label="Model" placeholder="Örn: 320d" required />
                        </div>
                        <Input name="engine_code" label="Motor Kodu / HP" placeholder="Örn: B47 / 190HP" required />
                        <Input name="ecu_type" label="ECU Tipi" placeholder="Örn: Bosch MD1" required />
                    </Card>

                    {/* Tuning Options */}
                    <Card className="p-6 border-gray-200 dark:border-gray-800 bg-white dark:bg-black flex flex-col">
                        <h2 className="text-xl font-bold text-foreground mb-4">İşlem Seçenekleri</h2>

                        <div className="flex-1 space-y-6 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                            {categories.map(cat => (
                                <div key={cat} className="space-y-3">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">{cat}</h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        {services.filter(s => (s.category || 'diğer') === cat).map((svc) => (
                                            <div
                                                key={svc.id}
                                                onClick={() => handleOptionToggle(svc.name)}
                                                className={`cursor-pointer p-3 rounded-xl border flex items-center justify-between transition-all group ${selectedOptions.includes(svc.name)
                                                    ? 'bg-primary/10 border-primary text-primary shadow-sm ring-1 ring-primary/20'
                                                    : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
                                                    }`}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold group-hover:text-foreground transition-colors">{svc.name}</span>
                                                    <span className="text-[10px] opacity-70">Standart İşlem</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-black">{svc.price} CR</span>
                                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selectedOptions.includes(svc.name) ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-700'}`}>
                                                        {selectedOptions.includes(svc.name) && <Check className="w-3 h-3 text-white" />}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between text-lg">
                                <span className="font-medium text-gray-500">Toplam Tutar:</span>
                                <span className={`font-black ${isLowBalance ? 'text-red-500' : 'text-primary'}`}>{totalCost} CR</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* File Upload */}
                <Card className="p-10 border-dashed border-2 border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-all group">
                    <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Orijinal Dosyayı Seçin</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-sm">
                        ECU'dan okuduğunuz orijinal dosyayı sürükleyin veya göz atın.<br />
                        <span className="text-[10px] text-gray-400 uppercase font-bold">.bin, .ori, .zip (Max 10MB)</span>
                    </p>
                    <input
                        type="file"
                        name="file"
                        required
                        className="block w-full text-sm text-gray-400 max-w-xs
                            file:mr-4 file:py-2.5 file:px-6
                            file:rounded-xl file:border-0
                            file:text-sm file:font-bold
                            file:bg-primary file:text-white
                            hover:file:bg-primary/90
                            cursor-pointer"
                    />
                </Card>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4">
                    <p className="text-xs text-gray-500 max-w-md text-center md:text-left">
                        Talebiniz gönderildiğinde toplam tutar bakiyenizden düşülecektir.
                        İşlem reddedilirse tutar hesabınıza iade edilir.
                    </p>
                    <Button
                        type="submit"
                        size="lg"
                        isLoading={isLoading}
                        disabled={isLowBalance || selectedOptions.length === 0}
                        className="w-full md:w-auto px-16 h-14 text-lg font-bold shadow-xl shadow-primary/20"
                    >
                        Talebi Gönder ({totalCost} CR)
                    </Button>
                </div>
            </form>
        </div>
    );
}
