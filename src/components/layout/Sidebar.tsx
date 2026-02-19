'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    UploadCloud,
    FileCode,
    CreditCard,
    Database,
    ShieldAlert,
    MessageCircle,
    DollarSign,
    Users,
    User,
    CheckSquare,
    Receipt,
    Settings,
} from 'lucide-react';

interface SidebarProps {
    userRole?: 'admin' | 'dealer';
    pendingApprovals?: number;
    unreadMessages?: number;
}

export function Sidebar({ userRole = 'dealer', pendingApprovals = 0, unreadMessages = 0 }: SidebarProps) {
    const pathname = usePathname();

    const dealerLinks = [
        { name: 'Panel', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Yeni Dosya İsteği', href: '/dashboard/files/new', icon: UploadCloud },
        { name: 'Dosyalarım', href: '/dashboard/files', icon: FileCode },
        { name: 'Hizmet Fiyatları', href: '/dashboard/services', icon: DollarSign },
        { name: 'Destek / Mesajlar', href: '/dashboard/messages', icon: MessageCircle, badge: unreadMessages },
        { name: 'Bosch Veritabanı', href: '/dashboard/bosch', icon: Database },
        { name: 'Kredi Yükle', href: '/dashboard/credits', icon: CreditCard },
        { name: 'Profilim', href: '/dashboard/profile', icon: User },
    ];

    const adminLinks = [
        { name: 'Admin Paneli', href: '/admin/dashboard', icon: ShieldAlert },
        { name: 'Dosya Talepleri', href: '/admin/dashboard/files', icon: FileCode },
        { name: 'Kayıt Onayları', href: '/admin/dashboard/approvals', icon: CheckSquare, badge: pendingApprovals },
        { name: 'Kullanıcılar', href: '/admin/dashboard/users', icon: Users },
        { name: 'Mesajlar', href: '/admin/dashboard/messages', icon: MessageCircle, badge: unreadMessages },
        { name: 'Ödemeler', href: '/admin/dashboard/payments', icon: Receipt },
        { name: 'Hizmet Fiyatları', href: '/admin/dashboard/services', icon: DollarSign },
        { name: 'İşlemler', href: '/admin/dashboard/transactions', icon: CreditCard },
        { name: 'Ayarlar', href: '/admin/dashboard/settings', icon: Settings },
        { name: 'Profilim', href: '/admin/dashboard/profile', icon: User },
    ];

    const links = userRole === 'admin' ? adminLinks : dealerLinks;

    return (
        <aside className="w-64 bg-background border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen fixed left-0 top-0 overflow-y-auto transition-colors z-40">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h1 className="text-2xl font-bold text-primary tracking-wider">TUNING<span className="text-foreground">PORTAL</span></h1>
                {userRole === 'admin' && (
                    <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Admin</span>
                )}
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || (link.href !== '/dashboard' && link.href !== '/admin/dashboard' && pathname.startsWith(link.href));
                    const badge = (link as any).badge;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors relative',
                                isActive
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-foreground'
                            )}
                        >
                            <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                            <span className="flex-1">{link.name}</span>
                            {badge > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0">
                                    {badge > 99 ? '99+' : badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {userRole !== 'admin' && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                    <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-foreground transition-colors">
                        <ShieldAlert className="w-4.5 h-4.5" />
                        Admin Paneli
                    </Link>
                </div>
            )}
        </aside>
    );
}
