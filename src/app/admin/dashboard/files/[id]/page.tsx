'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { UploadCloud, Download, CheckCircle, XCircle } from 'lucide-react';
import { ChatSection } from '@/components/files/ChatSection';

export default function ManageFilePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [file, setFile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    // Admin user name for chat alignment hacks (or fetching real me)
    // For now, hardcode Admin since this IS the admin page
    const adminName = 'Super Admin';

    useEffect(() => {
        fetch(`/api/files/${params.id}`)
            .then(res => res.json())
            .then(data => {
                setFile(data);
                setIsLoading(false);
            });
    }, [params.id]);

    async function handleStatusUpdate(status: string) {
        await fetch(`/api/files/${params.id}`, {
            method: 'PATCH',
            body: (() => {
                const fd = new FormData();
                fd.append('status', status);
                return fd;
            })()
        });
        router.refresh();
        window.location.reload();
    }

    async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsUploading(true);
        const formData = new FormData(e.currentTarget);
        formData.append('status', 'completed');

        await fetch(`/api/files/${params.id}`, {
            method: 'PATCH',
            body: formData
        });

        setIsUploading(false);
        router.refresh();
        window.location.reload();
    }

    if (isLoading) return <div className="text-foreground">Yükleniyor...</div>;
    if (!file) return <div className="text-foreground">Dosya bulunamadı</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">Talep Yönetimi #{file.id}</h1>
                <div className="flex gap-2">
                    <Button variant="danger" onClick={() => handleStatusUpdate('rejected')}>Reddet</Button>
                    <Button variant="secondary" onClick={() => handleStatusUpdate('processing')}>İşleme Al</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Card className="p-6 space-y-4 border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                        <div className="flex justify-between items-start">
                            <h2 className="text-xl font-bold text-foreground">Araç & Talep Detayları</h2>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${file.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    file.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                        file.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {file.status}
                                </span>
                                <div className="text-sm font-black text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
                                    {file.cost || 0} CR
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 text-sm">
                            <div className="space-y-1">
                                <label className="text-gray-500 block">Bayi / Müşteri</label>
                                <p className="text-foreground font-bold">{file.user_name}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-gray-500 block">Araç Marka Model</label>
                                <p className="text-foreground font-bold">{file.vehicle_make} {file.vehicle_model}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-gray-500 block">Motor Kodu / HP</label>
                                <p className="text-foreground font-medium">{file.engine_code || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-gray-500 block">ECU Tipi</label>
                                <p className="text-foreground font-medium">{file.ecu_type || '-'}</p>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <label className="text-gray-500 mb-2 block text-xs font-bold uppercase tracking-wider">İstenen İşlemler</label>
                            <div className="flex flex-wrap gap-2">
                                {JSON.parse(file.options || '[]').map((opt: string) => (
                                    <span key={opt} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-foreground rounded text-xs border border-gray-200 dark:border-gray-700">
                                        {opt}
                                    </span>
                                ))}
                                {JSON.parse(file.options || '[]').length === 0 && <span className="text-gray-400 italic text-xs">Seçenek belirtilmemiş</span>}
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                        <h3 className="text-lg font-bold text-foreground mb-4">Orijinal Dosya</h3>
                        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-900 p-3 rounded">
                            <span className="text-sm text-gray-500 truncate max-w-[200px]">{file.original_file_path?.split(/[/\\]/).pop()}</span>
                            <a href={`/api/files/download?path=${encodeURIComponent(file.original_file_path)}`} target="_blank">
                                <Button size="sm" variant="outline" className="gap-2">
                                    <Download className="w-4 h-4" /> İndir
                                </Button>
                            </a>
                        </div>
                    </Card>

                    <Card className="p-6 border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                        <h3 className="text-lg font-bold text-foreground mb-4">Modlu Dosya Yükle</h3>
                        {file.modded_file_path ? (
                            <div className="bg-green-100 dark:bg-green-900/20 border border-green-500 p-4 rounded text-center">
                                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                <p className="text-green-600 dark:text-green-400 font-medium">Dosya Gönderildi</p>
                                <p className="text-xs text-gray-500 mt-1">Durum: Tamamlandı</p>
                            </div>
                        ) : (
                            <form onSubmit={handleUpload} className="space-y-4">
                                <input type="file" name="modded_file" required className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer" />
                                <Button type="submit" className="w-full" isLoading={isUploading}>
                                    Yükle ve Tamamla
                                </Button>
                            </form>
                        )}
                    </Card>
                </div>

                {/* Chat Section */}
                <div className="h-full">
                    <ChatSection fileId={file.id} currentUserEmail={adminName} />
                </div>
            </div>
        </div>
    );
}
