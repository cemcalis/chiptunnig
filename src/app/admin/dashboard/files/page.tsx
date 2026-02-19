import { Card } from '@/components/ui/Card';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { FileListTable } from '@/app/admin/dashboard/files/FileListTable';
import { FileCode, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default async function AdminFilesPage() {
    const session = await getSession();
    if ((session as any)?.role !== 'admin') {
        redirect('/dashboard');
    }

    const files = db.prepare(`
        SELECT files.*, users.name as user_name, users.company_name as user_company
        FROM files 
        JOIN users ON files.user_id = users.id 
        ORDER BY files.created_at DESC
    `).all() as any[];

    const stats = {
        total: files.length,
        pending: files.filter(f => f.status === 'pending' || f.status === 'processing').length,
        completed: files.filter(f => f.status === 'completed').length,
        rejected: files.filter(f => f.status === 'rejected').length
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-foreground">Dosya Yönetimi</h1>
                    <p className="text-gray-500 font-medium">Tüm bayi taleplerini görün ve işlem yapın.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-5 border-none bg-white dark:bg-black shadow-sm ring-1 ring-gray-100 dark:ring-gray-900">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                            <FileCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Toplam Talep</p>
                            <p className="text-2xl font-black text-foreground">{stats.total}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-5 border-none bg-white dark:bg-black shadow-sm ring-1 ring-gray-100 dark:ring-gray-900">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl">
                            <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bekleyen/İşlemde</p>
                            <p className="text-2xl font-black text-foreground">{stats.pending}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-5 border-none bg-white dark:bg-black shadow-sm ring-1 ring-gray-100 dark:ring-gray-900">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tamamlanan</p>
                            <p className="text-2xl font-black text-foreground">{stats.completed}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-5 border-none bg-white dark:bg-black shadow-sm ring-1 ring-gray-100 dark:ring-gray-900">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Reddedilen</p>
                            <p className="text-2xl font-black text-foreground">{stats.rejected}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="overflow-hidden border-none bg-white dark:bg-black shadow-sm ring-1 ring-gray-100 dark:ring-gray-900 rounded-3xl">
                <FileListTable initialFiles={files} isAdmin={true} />
            </Card>
        </div>
    );
}
