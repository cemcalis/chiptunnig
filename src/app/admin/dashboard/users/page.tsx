import { Card } from '@/components/ui/Card';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserListTable } from './UserListTable';
import { Users, CreditCard, PlusCircle, MinusCircle } from 'lucide-react';

export default async function AdminUsersPage() {
    const session = await getSession();
    if ((session as any)?.role !== 'admin') {
        redirect('/dashboard');
    }

    const users = db.prepare('SELECT * FROM users WHERE role = ? ORDER BY created_at DESC').all('dealer');
    const totalCredits = (db.prepare("SELECT SUM(credits) as total FROM users WHERE role = 'dealer'").get() as any)?.total || 0;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Kullanıcı Yönetimi</h1>
                    <p className="text-gray-500">Bayi hesaplarını ve bakiyelerini yönetin.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-5 border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Toplam Bayi</p>
                            <p className="text-2xl font-bold text-foreground">{(users as any[]).length}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-5 border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                            <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Toplam Bakiye</p>
                            <p className="text-2xl font-bold text-foreground">{totalCredits.toLocaleString()} CR</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-5 border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-500 font-medium">Bakiye İşlem Rehberi</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <PlusCircle className="w-3.5 h-3.5 text-green-500" /> Mevcut bakiyeye ekler
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <MinusCircle className="w-3.5 h-3.5 text-orange-500" /> Mevcut bakiyeden düşer
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <CreditCard className="w-3.5 h-3.5 text-purple-500" /> Bakiyeyi belirli değere ayarlar
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="overflow-hidden border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                <UserListTable initialUsers={users as any[]} />
            </Card>
        </div>
    );
}
