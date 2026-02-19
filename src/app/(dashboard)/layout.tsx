import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import db from '@/lib/db';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    const userId = (session as any).id;
    const role = (session as any).role || 'dealer';

    // Unread admin messages for this user
    const unreadMessages = (db.prepare(
        "SELECT COUNT(*) as c FROM direct_messages WHERE user_id = ? AND sender_role = 'admin' AND is_read = 0"
    ).get(userId) as any).c;

    return (
        <div className="min-h-screen bg-background">
            <Sidebar userRole={role as 'admin' | 'dealer'} unreadMessages={unreadMessages} />
            <Navbar />
            <main className="pl-64 pt-16 min-h-screen">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
