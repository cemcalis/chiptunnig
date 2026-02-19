'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
    User,
    Building,
    Phone,
    Lock,
    Mail,
    Save,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Wallet
} from 'lucide-react';

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/profile');
            if (res.ok) {
                setProfile(await res.json());
            }
        } catch (error) {
            console.error('Fetch profile failed', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: profile.name,
                    company_name: profile.company_name,
                    phone: profile.phone
                })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Profil başarıyla güncellendi.' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Güncelleme yapılamadı.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Sistem hatası.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor.' });
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.new
                })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Şifreniz değiştirildi.' });
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Şifre değiştirilemedi.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Sistem hatası.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="text-center p-10 font-bold">Yükleniyor...</div>;
    if (!profile) return <div className="text-center p-10 font-bold">Kullanıcı bulunamadı.</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary border border-primary/20">
                        <User className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-foreground tracking-tight">{profile.name}</h1>
                        <p className="text-gray-500 font-medium">{profile.role === 'admin' ? 'Yönetici' : 'Kayıtlı Bayi'}</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Card className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-none ring-1 ring-gray-100 dark:ring-gray-800 flex items-center gap-3 rounded-2xl">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">Üyelik Tarihi</p>
                            <p className="text-sm font-bold text-foreground">{new Date(profile.created_at).toLocaleDateString()}</p>
                        </div>
                    </Card>
                    <Card className="px-6 py-3 bg-primary/10 border-none ring-1 ring-primary/20 flex items-center gap-3 rounded-2xl">
                        <Wallet className="w-5 h-5 text-primary" />
                        <div>
                            <p className="text-[10px] font-bold text-primary/70 uppercase leading-none">Bakiye</p>
                            <p className="text-sm font-black text-primary">{profile.credits} CR</p>
                        </div>
                    </Card>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 transition-all ${message.type === 'success' ? 'bg-green-100/50 border border-green-200 text-green-700' : 'bg-red-100/50 border border-red-200 text-red-700'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p className="font-bold">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Information Settings */}
                <Card className="p-8 border-none bg-white dark:bg-black shadow-sm ring-1 ring-gray-100 dark:ring-gray-900 rounded-3xl">
                    <h2 className="text-2xl font-black text-foreground mb-8 flex items-center gap-3">
                        <Building className="w-6 h-6 text-primary" /> Şirket & İletişim
                    </h2>
                    <form onSubmit={handleUpdateInfo} className="space-y-6">
                        <div className="space-y-4">
                            <Input
                                label="Ad Soyad"
                                value={profile.name}
                                onChange={e => setProfile({ ...profile, name: e.target.value })}
                                required
                            />
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">E-posta Adresi</p>
                                        <p className="text-sm font-bold text-foreground opacity-50">{profile.email}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-gray-300 uppercase italic">Değiştirilemez</span>
                            </div>
                            <Input
                                label="Şirket Ünvanı"
                                value={profile.company_name}
                                onChange={e => setProfile({ ...profile, company_name: e.target.value })}
                                placeholder="Tuning Garage"
                            />
                            <Input
                                label="Telefon Numarası"
                                value={profile.phone}
                                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                placeholder="+90 ..."
                            />
                        </div>
                        <Button type="submit" className="w-full h-14 rounded-2xl font-bold flex gap-2" isLoading={isSaving}>
                            <Save className="w-5 h-5" />
                            Bilgileri Güncelle
                        </Button>
                    </form>
                </Card>

                {/* Password Settings */}
                <Card className="p-8 border-none bg-white dark:bg-black shadow-sm ring-1 ring-gray-100 dark:ring-gray-900 rounded-3xl">
                    <h2 className="text-2xl font-black text-foreground mb-8 flex items-center gap-3">
                        <Lock className="w-6 h-6 text-primary" /> Şifre Güvenliği
                    </h2>
                    <form onSubmit={handleChangePassword} className="space-y-6">
                        <div className="space-y-6">
                            <Input
                                type="password"
                                label="Mevcut Şifre"
                                value={passwords.current}
                                onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                placeholder="••••••••"
                                required
                            />
                            <div className="h-px bg-gray-100 dark:bg-gray-800"></div>
                            <Input
                                type="password"
                                label="Yeni Şifre"
                                value={passwords.new}
                                onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                placeholder="••••••••"
                                required
                            />
                            <Input
                                type="password"
                                label="Yeni Şifre Tekrar"
                                value={passwords.confirm}
                                onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <Button type="submit" variant="outline" className="w-full h-14 rounded-2xl font-bold flex gap-2" isLoading={isSaving}>
                            Şifreyi Güncelle
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
