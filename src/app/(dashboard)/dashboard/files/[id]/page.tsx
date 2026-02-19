'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { UploadCloud, Download, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { ChatSection } from '@/components/files/ChatSection';
import Link from 'next/link';

export default function FileDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const router = useRouter();
    const [file, setFile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        // Fetch user session for chat identity
        fetch('/api/auth/me').then(res => res.json()).then(data => setUserEmail(data.name || 'User'));

        fetch(`/api/files/${id}`)
            .then(res => res.json())
            .then(data => {
                setFile(data);
                setIsLoading(false);
            })
            .catch(err => setIsLoading(false));
    }, [id]);

    if (isLoading) return <div className="text-center p-10 text-gray-500">Dosya bilgileri yükleniyor...</div>;
    if (!file) return <div className="text-center p-10 text-gray-500">Dosya bulunamadı.</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/files">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Dosya #{file.id}</h1>
                    <p className="text-gray-500 text-sm">Talep Detayları ve İletişim</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Details */}
                <div className="space-y-6">
                    <Card className="p-6 space-y-4 border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-sm">
                        <div className="flex justify-between items-start">
                            <h2 className="text-xl font-bold text-foreground">Araç Bilgileri</h2>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${file.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    file.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                        file.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {file.status === 'pending' ? 'Bekliyor' :
                                        file.status === 'processing' ? 'İşleniyor' :
                                            file.status === 'completed' ? 'Tamamlandı' : 'Reddedildi'}
                                </span>
                                <div className="text-sm font-black text-primary bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">
                                    {file.cost || 0} CR
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                            <div>
                                <label className="text-gray-500 block mb-1">Marka</label>
                                <p className="font-medium text-foreground">{file.vehicle_make}</p>
                            </div>
                            <div>
                                <label className="text-gray-500 block mb-1">Model</label>
                                <p className="font-medium text-foreground">{file.vehicle_model}</p>
                            </div>
                            <div>
                                <label className="text-gray-500 block mb-1">Motor</label>
                                <p className="font-medium text-foreground">{file.engine_code || '-'}</p>
                            </div>
                            <div>
                                <label className="text-gray-500 block mb-1">ECU</label>
                                <p className="font-medium text-foreground">{file.ecu_type || '-'}</p>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                            <label className="text-gray-500 mb-2 block text-sm">Seçilen Opsiyonlar</label>
                            <div className="flex flex-wrap gap-2">
                                {JSON.parse(file.options || '[]').map((opt: string) => (
                                    <span key={opt} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-foreground rounded text-xs border border-gray-200 dark:border-gray-700">
                                        {opt}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                        <h3 className="text-lg font-bold text-foreground mb-4">Dosyalar</h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <FileText className="w-5 h-5 text-gray-500" />
                                    <div className="truncate">
                                        <p className="text-sm font-medium text-foreground">Orijinal Dosya</p>
                                        <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                            {file.original_file_path?.split(/[/\\]/).pop()}
                                        </p>
                                    </div>
                                </div>
                                <Button size="sm" variant="outline" disabled>
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                                    Yüklendi
                                </Button>
                            </div>

                            {file.modded_file_path ? (
                                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded border border-green-200 dark:border-green-900/30">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <FileText className="w-5 h-5 text-green-600" />
                                        <div className="truncate">
                                            <p className="text-sm font-bold text-green-700 dark:text-green-500">Modlu Dosya (Hazır)</p>
                                            <p className="text-xs text-green-600/70 truncate max-w-[200px]">
                                                {file.modded_file_path?.split(/[/\\]/).pop()}
                                            </p>
                                        </div>
                                    </div>
                                    <a href={`/api/files/download?path=${encodeURIComponent(file.modded_file_path)}`} target="_blank">
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white border-green-600">
                                            <Download className="w-4 h-4 mr-2" />
                                            İndir
                                        </Button>
                                    </a>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded">
                                    <p className="text-sm text-gray-500">Modlu dosya hazırlanıyor...</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column: Chat */}
                <div className="h-full">
                    <ChatSection fileId={file.id} currentUserEmail={userEmail} />
                </div>
            </div>
        </div>
    );
}
