import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UploadCloud, FileCode, Clock, Wallet, ArrowRight, MessageCircle } from 'lucide-react';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export default async function DashboardPage() {
    const session = await getSession();
    const userId = (session as any)?.id;

    // Fetch user for real-time credits
    const user = db.prepare('SELECT credits FROM users WHERE id = ?').get(userId) as any;

    // Fetch recent files
    const stmt = db.prepare('SELECT * FROM files WHERE user_id = ? ORDER BY created_at DESC LIMIT 5');
    const files = stmt.all(userId) as any[];

    // Calculate stats
    const statsStmt = db.prepare('SELECT status, COUNT(*) as count FROM files WHERE user_id = ? GROUP BY status');
    const stats = statsStmt.all(userId) as any[];

    const getCount = (status: string) => stats.find((s: any) => s.status === status)?.count || 0;

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight">Hoşgeldiniz, <span className="text-primary">{(session as any)?.name}</span></h1>
                    <p className="text-gray-500 mt-2 font-medium">Tuning portalınıza genel bakış ve yönetim paneli.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/messages">
                        <Button variant="outline" className="h-14 px-6 rounded-2xl">
                            <MessageCircle className="w-5 h-5 mr-2" />
                            Mesajlar
                        </Button>
                    </Link>
                    <Link href="/dashboard/files/new">
                        <Button className="h-14 px-8 rounded-2xl shadow-xl shadow-primary/20">
                            <UploadCloud className="w-5 h-5 mr-2" />
                            Yeni Dosya İsteği
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-8 border-none bg-white dark:bg-black shadow-sm ring-1 ring-gray-100 dark:ring-gray-900 rounded-3xl group overflow-hidden relative">
                    <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-colors"></div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-2xl">
                            <Clock className="text-yellow-600 dark:text-yellow-500 w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-yellow-600 tracking-widest bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-lg">Aktif</span>
                    </div>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Bekleyen İşlemler</p>
                    <p className="text-4xl font-black text-foreground mt-1">{getCount('pending') + getCount('processing')}</p>
                </Card>

                <Card className="p-8 border-none bg-white dark:bg-black shadow-sm ring-1 ring-gray-100 dark:ring-gray-900 rounded-3xl group overflow-hidden relative">
                    <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors"></div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                            <FileCode className="text-green-600 dark:text-green-500 w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-green-600 tracking-widest bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-lg">Bitmiş</span>
                    </div>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Tamamlananlar</p>
                    <p className="text-4xl font-black text-foreground mt-1">{getCount('completed')}</p>
                </Card>

                <Link href="/dashboard/credits">
                    <Card className="p-8 border-none bg-primary text-white shadow-2xl shadow-primary/20 rounded-3xl group overflow-hidden relative cursor-pointer hover:scale-[1.02] transition-transform">
                        <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                <Wallet className="text-white w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black uppercase text-white/70 tracking-widest border border-white/20 px-2 py-1 rounded-lg">Cüzdan</span>
                        </div>
                        <p className="text-sm font-bold opacity-80">Mevcut Bakiye</p>
                        <p className="text-4xl font-black mt-1">{user?.credits || 0} <span className="text-xl opacity-60">CR</span></p>
                    </Card>
                </Link>
            </div>

            {/* Recent Files */}
            <Card className="border-none bg-white dark:bg-black shadow-sm ring-1 ring-gray-100 dark:ring-gray-900 rounded-3xl overflow-hidden">
                <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-foreground">Son Dosya Talepleri</h3>
                        <p className="text-sm text-gray-500 font-medium">En son yüklediğiniz 5 dosyanın durumu.</p>
                    </div>
                    <Link href="/dashboard/files">
                        <Button variant="ghost" className="rounded-xl group">
                            Tümünü Gör <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-400 uppercase text-[10px] font-black tracking-widest">
                            <tr>
                                <th className="px-8 py-4">Araç & Yazılım</th>
                                <th className="px-8 py-4">Fiyat</th>
                                <th className="px-8 py-4">Durum</th>
                                <th className="px-8 py-4">Tarih</th>
                                <th className="px-8 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {files.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <UploadCloud className="w-12 h-12 text-gray-200" />
                                            <p className="text-gray-400 font-medium">Henüz bir dosya talebiniz bulunmuyor.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                files.map((file) => (
                                    <tr key={file.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="font-black text-foreground">{file.vehicle_make} {file.vehicle_model}</div>
                                            <div className="text-xs text-gray-400 font-bold uppercase tracking-tighter mt-1">{file.ecu_type || 'Standart ECU'}</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="font-black text-gray-600 dark:text-gray-300">{file.cost || 0} CR</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest
                                                ${file.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    file.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                        file.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'}`}>
                                                {file.status === 'pending' ? 'Bekliyor' :
                                                    file.status === 'processing' ? 'İşleniyor' :
                                                        file.status === 'completed' ? 'Tamamlandı' : 'Reddedildi'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-medium text-gray-500">
                                            {new Date(file.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <Link href={`/dashboard/files/${file.id}`}>
                                                <Button size="sm" variant="ghost" className="rounded-lg h-9">
                                                    Detay <ArrowRight className="w-4 h-4 ml-2" />
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
