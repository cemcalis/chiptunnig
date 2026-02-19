
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Clock, CheckCircle, ArrowRight, Users, CreditCard, AlertCircle, UserCheck } from 'lucide-react';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminDashboardPage() {
    const session = await getSession();
    if ((session as any)?.role !== 'admin') {
        redirect('/dashboard');
    }

    // Fetch stats
    const pendingCount = (db.prepare("SELECT COUNT(*) as count FROM files WHERE status = 'pending'").get() as any).count;
    const completedCount = (db.prepare("SELECT COUNT(*) as count FROM files WHERE status = 'completed'").get() as any).count;
    const userCount = (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'dealer' AND status = 'approved'").get() as any).count;
    const pendingApprovalCount = (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'dealer' AND status = 'pending'").get() as any).count;
    const pendingPaymentCount = (db.prepare("SELECT COUNT(*) as count FROM payment_requests WHERE status = 'pending'").get() as any).count;

    // Fetch recent files
    const recentFiles = db.prepare(`
        SELECT files.*, users.name as user_name 
        FROM files 
        JOIN users ON files.user_id = users.id 
        ORDER BY files.created_at DESC 
        LIMIT 5
    `).all() as any[];

    // Fetch pending payment requests
    const pendingPayments = db.prepare(`
        SELECT payment_requests.*, users.name as user_name, users.company_name
        FROM payment_requests 
        JOIN users ON payment_requests.user_id = users.id 
        WHERE payment_requests.status = 'pending'
        ORDER BY payment_requests.created_at DESC
        LIMIT 5
    `).all() as any[];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Yönetici Paneli</h1>
                    <p className="text-gray-500">Sisteme genel bakış ve son işlemler.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/dashboard/users">
                        <Button variant="outline">
                            <Users className="w-4 h-4 mr-2" />
                            Kullanıcılar
                        </Button>
                    </Link>
                    <Link href="/admin/dashboard/payments">
                        <Button variant="outline" className="relative">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Ödemeler
                            {pendingPaymentCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                    {pendingPaymentCount}
                                </span>
                            )}
                        </Button>
                    </Link>
                    <Link href="/admin/dashboard/transactions">
                        <Button variant="outline">İşlemler</Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Bekleyen Dosyalar</p>
                            <h3 className="text-3xl font-bold text-foreground mt-2">{pendingCount}</h3>
                        </div>
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                            <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Tamamlananlar</p>
                            <h3 className="text-3xl font-bold text-foreground mt-2">{completedCount}</h3>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-500" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Toplam Bayi</p>
                            <h3 className="text-3xl font-bold text-foreground mt-2">{userCount}</h3>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                        </div>
                    </div>
                </Card>

                <Link href="/admin/dashboard/approvals">
                    <Card className={`p-6 border-gray-200 dark:border-gray-800 bg-white dark:bg-black cursor-pointer hover:shadow-md transition-shadow ${pendingApprovalCount > 0 ? 'ring-2 ring-yellow-400/30' : ''}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Onay Bekleyenler</p>
                                <h3 className={`text-3xl font-bold mt-2 ${pendingApprovalCount > 0 ? 'text-yellow-500' : 'text-foreground'}`}>{pendingApprovalCount}</h3>
                            </div>
                            <div className={`p-3 rounded-full ${pendingApprovalCount > 0 ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <UserCheck className={`w-6 h-6 ${pendingApprovalCount > 0 ? 'text-yellow-500' : 'text-gray-400'}`} />
                            </div>
                        </div>
                    </Card>
                </Link>
            </div>

            {/* Alert banners */}
            <div className="space-y-3">
                {pendingApprovalCount > 0 && (
                    <div className="flex items-center justify-between p-4 rounded-xl border border-yellow-200 dark:border-yellow-800/40 bg-yellow-50 dark:bg-yellow-900/10">
                        <div className="flex items-center gap-3">
                            <UserCheck className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                            <p className="font-medium text-yellow-800 dark:text-yellow-400">
                                <strong>{pendingApprovalCount}</strong> yeni bayi başvurusu onay bekliyor.
                            </p>
                        </div>
                        <Link href="/admin/dashboard/approvals">
                            <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white whitespace-nowrap">
                                İncele <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </div>
                )}
                {pendingPaymentCount > 0 && (
                    <div className="flex items-center justify-between p-4 rounded-xl border border-orange-200 dark:border-orange-800/40 bg-orange-50 dark:bg-orange-900/10">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                            <p className="font-medium text-orange-800 dark:text-orange-400">
                                <strong>{pendingPaymentCount}</strong> bekleyen ödeme talebi var.
                            </p>
                        </div>
                        <Link href="/admin/dashboard/payments">
                            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white whitespace-nowrap">
                                İncele <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Recent Files Table */}
            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-foreground">Son Dosya Talepleri</h3>
                    <Link href="/admin/dashboard/files">
                        <Button size="sm" variant="ghost">Tümünü Gör <ArrowRight className="w-4 h-4 ml-1" /></Button>
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Bayi</th>
                                <th className="px-6 py-3">Araç</th>
                                <th className="px-6 py-3">Durum</th>
                                <th className="px-6 py-3">Tarih</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {recentFiles.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Henüz talep yok.</td>
                                </tr>
                            ) : (
                                recentFiles.map((file) => (
                                    <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                        <td className="px-6 py-4 font-medium">#{file.id}</td>
                                        <td className="px-6 py-4">{file.user_name}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-foreground font-medium">{file.vehicle_make} {file.vehicle_model}</div>
                                            <div className="text-xs text-gray-500">{file.engine_code}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${file.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                file.status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    file.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}>
                                                {file.status === 'pending' ? 'Bekliyor' :
                                                    file.status === 'processing' ? 'İşleniyor' :
                                                        file.status === 'completed' ? 'Tamamlandı' : 'Reddedildi'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{new Date(file.created_at).toLocaleDateString('tr-TR')}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/admin/dashboard/files/${file.id}`}>
                                                <Button size="sm" variant="ghost">
                                                    Detay <ArrowRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </Link>
                                        </td>
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
