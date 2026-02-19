import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import db from '@/lib/db';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    if ((session as any).role !== 'admin') {
        redirect('/dashboard');
    }

    // Fetch badge counts
    const pendingApprovals = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'dealer' AND status = 'pending'").get() as any).c;
    const unreadMessages = (db.prepare("SELECT COUNT(*) as c FROM direct_messages WHERE sender_role = 'user' AND is_read = 0").get() as any).c;

    return (
        <div className="min-h-screen bg-background">
            <Sidebar userRole="admin" pendingApprovals={pendingApprovals} unreadMessages={unreadMessages} />
            <Navbar />
            <main className="pl-64 pt-16 min-h-screen">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
