'use client';

import { useState, useMemo } from 'react';
import {
    Search,
    Filter,
    FileText,
    ChevronRight,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowRight,
    User as UserIcon,
    Car
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface FileData {
    id: number;
    user_id: number;
    user_name?: string;
    user_company?: string;
    vehicle_make: string;
    vehicle_model: string;
    engine_code: string;
    ecu_type: string;
    status: string;
    cost: number;
    created_at: string;
}

interface FileListTableProps {
    initialFiles: FileData[];
    isAdmin?: boolean;
}

export function FileListTable({ initialFiles, isAdmin = false }: FileListTableProps) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredFiles = useMemo(() => {
        return initialFiles.filter(file => {
            const matchesSearch =
                file.vehicle_make.toLowerCase().includes(search.toLowerCase()) ||
                file.vehicle_model.toLowerCase().includes(search.toLowerCase()) ||
                file.engine_code?.toLowerCase().includes(search.toLowerCase()) ||
                file.ecu_type?.toLowerCase().includes(search.toLowerCase()) ||
                (isAdmin && (file.user_name?.toLowerCase().includes(search.toLowerCase()) || file.user_company?.toLowerCase().includes(search.toLowerCase())));

            const matchesStatus = statusFilter === 'all' || file.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [initialFiles, search, statusFilter, isAdmin]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Tamamlandı</span>;
            case 'processing':
                return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3 h-3" /> İşleniyor</span>;
            case 'rejected':
                return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><XCircle className="w-3 h-3" /> Reddedildi</span>;
            default:
                return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3 h-3" /> Beklemede</span>;
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Filter Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={isAdmin ? "Araç, motor, ECU veya bayi ara..." : "Araç, motor veya ECU ara..."}
                        className="w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary text-sm font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            className="h-12 pl-10 pr-8 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary text-sm font-bold appearance-none cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Tüm Durumlar</option>
                            <option value="pending">Beklemede</option>
                            <option value="processing">İşleniyor</option>
                            <option value="completed">Tamamlandı</option>
                            <option value="rejected">Reddedildi</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 dark:bg-gray-900/30 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <tr>
                            <th className="px-8 py-4">ID</th>
                            {isAdmin && <th className="px-8 py-4">Bayi</th>}
                            <th className="px-8 py-4">Araç & Yazılım</th>
                            <th className="px-8 py-4">Fiyat</th>
                            <th className="px-8 py-4 text-center">Durum</th>
                            <th className="px-8 py-4">Tarih</th>
                            <th className="px-8 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredFiles.length === 0 ? (
                            <tr>
                                <td colSpan={isAdmin ? 7 : 6} className="px-8 py-20 text-center text-gray-400 font-medium">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                    Sonuç bulunamadı.
                                </td>
                            </tr>
                        ) : (
                            filteredFiles.map((file) => (
                                <tr key={file.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors group">
                                    <td className="px-8 py-5 text-gray-400 text-xs font-bold">#{file.id}</td>

                                    {isAdmin && (
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                                    <UserIcon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-foreground leading-none">{file.user_name}</div>
                                                    <div className="text-[10px] text-gray-500 font-medium mt-1">{file.user_company}</div>
                                                </div>
                                            </div>
                                        </td>
                                    )}

                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                                                <Car className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-foreground">{file.vehicle_make} {file.vehicle_model}</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-1">{file.ecu_type || 'Standart ECU'}</div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-8 py-5 text-sm font-black text-primary">
                                        {file.cost || 0} CR
                                    </td>

                                    <td className="px-8 py-5">
                                        <div className="flex justify-center">
                                            {getStatusBadge(file.status)}
                                        </div>
                                    </td>

                                    <td className="px-8 py-5 text-[11px] font-bold text-gray-500">
                                        {new Date(file.created_at).toLocaleDateString('tr-TR')}
                                    </td>

                                    <td className="px-8 py-5 text-right">
                                        <Link href={isAdmin ? `/admin/dashboard/files/${file.id}` : `/dashboard/files/${file.id}`}>
                                            <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                                                Detay <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
