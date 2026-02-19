import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { FileListTable } from '@/app/admin/dashboard/files/FileListTable';
import { Card } from '@/components/ui/Card';
import { FileCode, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default async function MyFilesPage() {
    const session = await getSession();
    const userId = (session as any)?.id;

    const files = db.prepare('SELECT * FROM files WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-foreground">Dosyalarım</h1>
                    <p className="text-gray-500 font-medium tracking-tight">Yüklediğiniz tüm dosyalar ve durumları.</p>
                </div>
                <Link href="/dashboard/files/new">
                    <Button className="h-14 px-8 rounded-2xl shadow-xl shadow-primary/20">
                        <UploadCloud className="w-5 h-5 mr-2" />
                        Yeni Dosya Yükle
                    </Button>
                </Link>
            </div>

            <Card className="overflow-hidden border-none bg-white dark:bg-black shadow-sm ring-1 ring-gray-100 dark:ring-gray-900 rounded-3xl">
                <FileListTable initialFiles={files} isAdmin={false} />
            </Card>
        </div>
    );
}
