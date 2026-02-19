'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' },
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || 'Giriş yapılamadı');
            }

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 transition-colors">
            <Card className="w-full max-w-md p-8 border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-foreground shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black mb-2 text-primary">TUNINGPORTAL</h1>
                    <h2 className="text-xl font-semibold">Bayi Girişi</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Hesabınıza erişmek için bilgilerinizi girin</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm p-3 rounded mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="E-posta Adresi"
                        name="email"
                        type="email"
                        placeholder="admin@tuningportal.com"
                        required
                    />
                    <Input
                        label="Şifre"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                    />

                    <Button type="submit" className="w-full" isLoading={isLoading} size="lg">
                        Giriş Yap
                    </Button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500">
                    Hesabınız yok mu?{' '}
                    <Link href="/register" className="text-primary hover:underline font-bold">
                        Hemen Başvurun
                    </Link>
                </div>
            </Card>
        </div>
    );
}
