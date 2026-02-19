import { Card } from '@/components/ui/Card';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminTransactionsPage() {
    const session = await getSession();
    if ((session as any)?.role !== 'admin') {
        redirect('/dashboard');
    }

    const transactions = db.prepare(`
        SELECT transactions.*, users.name as user_name, users.company_name 
        FROM transactions 
        JOIN users ON transactions.user_id = users.id 
        ORDER BY created_at DESC 
        LIMIT 100
    `).all() as any[];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">İşlem Kayıtları</h1>
                    <p className="text-gray-500">Tüm kredi yükleme ve harcama geçmişi.</p>
                </div>
            </div>

            <Card className="overflow-hidden border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Bayi</th>
                                <th className="px-6 py-3">İşlem Tipi</th>
                                <th className="px-6 py-3">Tutar</th>
                                <th className="px-6 py-3">Açıklama</th>
                                <th className="px-6 py-3">Tarih</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Kayıt bulunamadı.</td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                        <td className="px-6 py-4">#{tx.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-foreground font-medium">{tx.user_name}</div>
                                            <div className="text-xs text-gray-500">{tx.company_name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${tx.type === 'deposit' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {tx.type === 'deposit' ? 'Yükleme' : 'Harcama'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-foreground">
                                            <div className="flex items-center gap-1">
                                                {tx.type === 'deposit' ? (
                                                    <ArrowDownLeft className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <ArrowUpRight className="w-4 h-4 text-red-500" />
                                                )}
                                                {tx.amount} CR
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate">{tx.description}</td>
                                        <td className="px-6 py-4">{new Date(tx.created_at).toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
