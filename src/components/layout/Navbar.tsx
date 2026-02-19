
import Link from 'next/link';
import { getSession, logout } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { redirect } from 'next/navigation';

export async function Navbar() {
    const session = await getSession();
    const user = session as any;

    async function handleLogout() {
        'use server';
        await logout();
        redirect('/login');
    }

    return (
        <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-white hidden md:block">
                    TUNING<span className="text-primary">PORTAL</span>
                </h2>
            </div>

            <div className="flex items-center gap-6">
                <Link
                    href={user?.role === 'admin' ? '/admin/dashboard/profile' : '/dashboard/profile'}
                    className="hidden md:flex flex-col items-end hover:opacity-80 transition-opacity group"
                >
                    <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{user?.name}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black leading-none mt-1">
                        {user?.role === 'admin' ? 'Yönetici' : 'Bayi'}
                    </span>
                </Link>

                {user?.role !== 'admin' && (
                    <div className="bg-gray-900 px-4 py-1.5 rounded-full border border-gray-800 flex items-center gap-2">
                        <span className="text-xs text-gray-400">Bakiye:</span>
                        <span className="text-sm font-bold text-primary">{user?.credits} CR</span>
                    </div>
                )}

                <ThemeToggle />

                <form action={handleLogout}>
                    <Button variant="outline" size="sm" className="text-red-400 hover:text-red-300 border-red-900/50 hover:bg-red-900/20">
                        Çıkış Yap
                    </Button>
                </form>
            </div>
        </nav>
    );
}
