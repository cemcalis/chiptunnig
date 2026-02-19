'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { CheckCircle, Clock } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        if (data.password !== data.confirmPassword) {
            setError('Şifreler eşleşmiyor.');
            setIsLoading(false);
            return;
        }

        if ((data.password as string).length < 6) {
            setError('Şifre en az 6 karakter olmalıdır.');
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' },
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.error || 'Kayıt sistemi hatası');
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md p-8 border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-foreground shadow-2xl text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Başvurunuz Alındı!</h2>
                    <div className="flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 mb-4">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <p className="text-sm font-medium">Admin onayı bekleniyor</p>
                    </div>
                    <p className="text-gray-500 text-sm mb-6">
                        Başvurunuz alındı. Admin hesabınızı onayladıktan sonra sisteme giriş yapabilirsiniz. Bu işlem genellikle 24 saat içinde tamamlanır.
                    </p>
                    <Link href="/login">
                        <Button variant="outline" className="w-full">Giriş Sayfasına Dön</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 transition-colors">
            <Card className="w-full max-w-lg p-8 border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-foreground shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black mb-2 text-primary">TUNINGPORTAL</h1>
                    <h2 className="text-xl font-semibold">Bayi Başvurusu</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Ağımıza katılmak için formu doldurun. Admin onayından sonra erişim sağlayabilirsiniz.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm p-3 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Ad Soyad" name="name" placeholder="John Doe" required />
                        <Input label="Şirket Adı" name="company_name" placeholder="Tuning Garage" />
                    </div>

                    <Input label="E-posta Adresi" name="email" type="email" placeholder="john@example.com" required />
                    <Input label="Telefon" name="phone" type="tel" placeholder="+90 555 ..." />

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Şifre" name="password" type="password" placeholder="••••••••" required />
                        <Input label="Şifre Tekrar" name="confirmPassword" type="password" placeholder="••••••••" required />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-3 flex items-start gap-2">
                        <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-700 dark:text-blue-400">
                            Başvurunuz admin tarafından incelendikten sonra sisteme erişim hakkı kazanacaksınız.
                        </p>
                    </div>

                    <Button type="submit" className="w-full mt-4" isLoading={isLoading} size="lg">
                        Başvuruyu Tamamla
                    </Button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500">
                    Zaten hesabınız var mı?{' '}
                    <Link href="/login" className="text-primary hover:underline font-bold">
                        Giriş Yapın
                    </Link>
                </div>
            </Card>
        </div>
    );
}
