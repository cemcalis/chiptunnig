'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Check, X, User, Clock, Building, Phone, Mail, ChevronDown } from 'lucide-react';

interface PendingUser {
    id: number;
    name: string;
    company_name: string;
    email: string;
    phone: string;
    status: string;
    created_at: string;
}

export default function AdminApprovalsPage() {
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [rejectedUsers, setRejectedUsers] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [rejectModal, setRejectModal] = useState<{ user: PendingUser; reason: string } | null>(null);
    const [showRejected, setShowRejected] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [pendRes, rejRes] = await Promise.all([
            fetch('/api/admin/approvals?status=pending'),
            fetch('/api/admin/approvals?status=rejected'),
        ]);
        if (pendRes.ok) setPendingUsers(await pendRes.json());
        if (rejRes.ok) setRejectedUsers(await rejRes.json());
        setLoading(false);
    };

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3000);
    };

    const handleApprove = async (userId: number) => {
        setActionLoading(userId);
        try {
            const res = await fetch('/api/admin/approvals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action: 'approve' }),
            });
            if (res.ok) {
                showToast('success', 'Kullanıcı onaylandı.');
                fetchData();
            } else {
                showToast('error', 'İşlem başarısız.');
            }
        } catch {
            showToast('error', 'Bağlantı hatası.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!rejectModal) return;
        setActionLoading(rejectModal.user.id);
        try {
            const res = await fetch('/api/admin/approvals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: rejectModal.user.id, action: 'reject', reason: rejectModal.reason }),
            });
            if (res.ok) {
                showToast('success', 'Kullanıcı reddedildi.');
                setRejectModal(null);
                fetchData();
            } else {
                showToast('error', 'İşlem başarısız.');
            }
        } catch {
            showToast('error', 'Bağlantı hatası.');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${toast.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                    }`}>
                    {toast.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">Kayıt Onayları</h1>
                <p className="text-gray-500 mt-1">Yeni bayi başvurularını inceleyin ve onaylayın.</p>
            </div>

            {/* Pending Users */}
            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-foreground">Onay Bekleyenler</h2>
                        {pendingUsers.length > 0 && (
                            <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold px-2.5 py-1 rounded-full">
                                {pendingUsers.length}
                            </span>
                        )}
                    </div>
                    <Clock className="w-5 h-5 text-yellow-500" />
                </div>

                {pendingUsers.length === 0 ? (
                    <div className="p-12 text-center">
                        <Check className="w-12 h-12 mx-auto mb-3 text-green-400 opacity-50" />
                        <p className="text-gray-500">Bekleyen başvuru yok.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {pendingUsers.map((user) => (
                            <div key={user.id} className="p-6 flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                                        <User className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-gray-900 dark:text-white text-lg">{user.name}</div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                            {user.company_name && (
                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Building className="w-3 h-3" /> {user.company_name}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                                <Mail className="w-3 h-3" /> {user.email}
                                            </span>
                                            {user.phone && (
                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Phone className="w-3 h-3" /> {user.phone}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            Başvuru: {new Date(user.created_at).toLocaleString('tr-TR')}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => setRejectModal({ user, reason: '' })}
                                        disabled={actionLoading === user.id}
                                        className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                    >
                                        <X className="w-4 h-4" /> Reddet
                                    </button>
                                    <button
                                        onClick={() => handleApprove(user.id)}
                                        disabled={actionLoading === user.id}
                                        className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                    >
                                        {actionLoading === user.id
                                            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            : <Check className="w-4 h-4" />
                                        }
                                        Onayla
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Rejected Users (collapsible) */}
            {rejectedUsers.length > 0 && (
                <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black overflow-hidden">
                    <button
                        onClick={() => setShowRejected(!showRejected)}
                        className="w-full p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-foreground">Reddedilenler</h2>
                            <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold px-2.5 py-1 rounded-full">
                                {rejectedUsers.length}
                            </span>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showRejected ? 'rotate-180' : ''}`} />
                    </button>

                    {showRejected && (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {rejectedUsers.map((user) => (
                                <div key={user.id} className="p-6 flex flex-col md:flex-row md:items-center gap-4 opacity-70">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                                            <User className="w-4 h-4 text-red-500" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 dark:text-white">{user.name}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                            {(user as any).rejection_reason && (
                                                <div className="text-xs text-red-500 mt-0.5">Red sebebi: {(user as any).rejection_reason}</div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleApprove(user.id)}
                                        disabled={actionLoading === user.id}
                                        className="px-3 py-1.5 rounded-lg border border-green-300 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 text-xs font-medium transition-colors"
                                    >
                                        Onayla
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {/* Reject Modal */}
            {rejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/20">
                                <X className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Başvuruyu Reddet</h3>
                                <p className="text-xs text-gray-500">{rejectModal.user.name}</p>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="text-xs text-gray-500 font-medium block mb-1.5">Red Sebebi (opsiyonel)</label>
                            <textarea
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30 resize-none"
                                rows={3}
                                placeholder="Reddetme sebebinizi yazın..."
                                value={rejectModal.reason}
                                onChange={e => setRejectModal({ ...rejectModal, reason: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setRejectModal(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={actionLoading !== null}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                Reddet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
