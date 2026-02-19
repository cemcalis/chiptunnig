'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
    Settings,
    CreditCard,
    Globe,
    Save,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<any>({
        account_holder: '',
        iban: '',
        site_name: 'Tuning Portal',
        contact_phone: '',
        contact_email: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                setSettings((prev: any) => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error('Fetch settings failed', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Ayarlar başarıyla kaydedildi.' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                throw new Error('Kaydedilemedi');
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Sistem hatası oluştu.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="text-center p-10 font-bold">Yükleniyor...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-2xl">
                    <Settings className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-foreground">Sistem Ayarları</h1>
                    <p className="text-gray-500 font-medium">Platform genelindeki statik bilgileri yönetin.</p>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 transition-all ${message.type === 'success' ? 'bg-green-100/50 border border-green-200 text-green-700' : 'bg-red-100/50 border border-red-200 text-red-700'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p className="font-bold">{message.text}</p>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-8">
                {/* Bank Settings */}
                <Card className="p-8 border-none bg-white dark:bg-black shadow-sm ring-1 ring-gray-100 dark:ring-gray-900 rounded-3xl">
                    <h2 className="text-xl font-black text-foreground mb-6 flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-primary" /> Ödeme & Banka Bilgileri
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Banka Alıcı Adı"
                            value={settings.account_holder}
                            onChange={e => setSettings({ ...settings, account_holder: e.target.value })}
                            placeholder="Örn: Tuning Portal LTD."
                        />
                        <Input
                            label="IBAN Numarası"
                            value={settings.iban}
                            onChange={e => setSettings({ ...settings, iban: e.target.value })}
                            placeholder="TR00..."
                        />
                    </div>
                    <p className="mt-4 text-[10px] text-gray-400 uppercase font-black tracking-widest">
                        Bu bilgiler "Kredi Yükle" sayfasında bayilere gösterilir.
                    </p>
                </Card>

                {/* General Settings */}
                <Card className="p-8 border-none bg-white dark:bg-black shadow-sm ring-1 ring-gray-100 dark:ring-gray-900 rounded-3xl">
                    <h2 className="text-xl font-black text-foreground mb-6 flex items-center gap-3">
                        <Globe className="w-5 h-5 text-primary" /> Genel Bilgiler
                    </h2>
                    <div className="space-y-6">
                        <Input
                            label="Site Başlığı"
                            value={settings.site_name}
                            onChange={e => setSettings({ ...settings, site_name: e.target.value })}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Destek Telefonu"
                                value={settings.contact_phone}
                                onChange={e => setSettings({ ...settings, contact_phone: e.target.value })}
                                placeholder="+90 ..."
                            />
                            <Input
                                label="Destek E-postası"
                                value={settings.contact_email}
                                onChange={e => setSettings({ ...settings, contact_email: e.target.value })}
                                placeholder="destek@tuningportal.com"
                            />
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" className="h-14 px-12 rounded-2xl shadow-xl shadow-primary/20 flex gap-2 items-center" isLoading={isSaving}>
                        <Save className="w-5 h-5" />
                        Ayarları Kaydet
                    </Button>
                </div>
            </form>
        </div>
    );
}
