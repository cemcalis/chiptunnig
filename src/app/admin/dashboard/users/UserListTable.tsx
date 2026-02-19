'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import {
    User, Trash2, X, Check, PlusCircle, MinusCircle,
    Edit3, ChevronDown, ChevronUp, CreditCard, AlertTriangle, Settings2,
    Search, Filter, Mail, Phone as PhoneIcon, Building
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserData {
    id: number;
    name: string;
    company_name: string;
    email: string;
    phone: string;
    credits: number;
    role: string;
    status: string;
    created_at: string;
}

type ModalType = 'edit' | 'add_credits' | 'subtract_credits' | 'set_credits' | 'delete' | null;

interface ModalState {
    type: ModalType;
    user: UserData | null;
}

export function UserListTable({ initialUsers }: { initialUsers: UserData[] }) {
    const router = useRouter();
    const [users, setUsers] = useState(initialUsers);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [modal, setModal] = useState<ModalState>({ type: null, user: null });
    const [creditAmount, setCreditAmount] = useState('');
    const [editData, setEditData] = useState<Partial<UserData>>({});
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesSearch =
                u.name?.toLowerCase().includes(search.toLowerCase()) ||
                u.email?.toLowerCase().includes(search.toLowerCase()) ||
                u.company_name?.toLowerCase().includes(search.toLowerCase()) ||
                u.phone?.toLowerCase().includes(search.toLowerCase());

            const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [users, search, statusFilter]);

    const openModal = (type: ModalType, user: UserData) => {
        setModal({ type, user });
        setCreditAmount('');
        setEditData({ ...user });
        setSuccessMsg('');
        setErrorMsg('');
    };

    const closeModal = () => {
        setModal({ type: null, user: null });
        setCreditAmount('');
        setEditData({});
        setSuccessMsg('');
        setErrorMsg('');
    };

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const showError = (msg: string) => {
        setErrorMsg(msg);
        setTimeout(() => setErrorMsg(''), 4000);
    };

    // Edit user info
    const handleSaveEdit = async () => {
        if (!modal.user) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${modal.user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData),
            });
            if (res.ok) {
                setUsers(users.map(u => u.id === modal.user!.id ? { ...u, ...editData } as UserData : u));
                showSuccess('Kullanıcı güncellendi.');
                closeModal();
                router.refresh();
            } else {
                showError('Güncelleme başarısız.');
            }
        } catch {
            showError('Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    // Delete user
    const handleDelete = async () => {
        if (!modal.user) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${modal.user.id}`, { method: 'DELETE' });
            if (res.ok) {
                setUsers(users.filter(u => u.id !== modal.user!.id));
                showSuccess('Kullanıcı silindi.');
                closeModal();
                router.refresh();
            } else {
                const data = await res.json();
                showError(data.error || 'Silme başarısız.');
            }
        } catch {
            showError('Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    // Credit operations
    const handleCreditAction = async (action: 'add' | 'subtract' | 'set') => {
        if (!modal.user) return;
        const amount = parseFloat(creditAmount);
        if (isNaN(amount) || amount < 0) {
            showError('Geçerli bir miktar girin.');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${modal.user.id}/credits`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, amount }),
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(users.map(u => u.id === modal.user!.id ? { ...u, credits: data.newCredits } : u));
                const actionLabel = action === 'add' ? 'eklendi' : action === 'subtract' ? 'düşüldü' : 'ayarlandı';
                showSuccess(`Bakiye başarıyla ${actionLabel}.`);
                closeModal();
                router.refresh();
            } else {
                const data = await res.json();
                showError(data.error || 'İşlem başarısız.');
            }
        } catch {
            showError('Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const getModalTitle = () => {
        switch (modal.type) {
            case 'edit': return 'Kullanıcı Düzenle';
            case 'add_credits': return 'Bakiye Ekle';
            case 'subtract_credits': return 'Bakiye Düş';
            case 'set_credits': return 'Bakiye Ayarla';
            case 'delete': return 'Kullanıcıyı Sil';
            default: return '';
        }
    };

    const getModalIcon = () => {
        switch (modal.type) {
            case 'edit': return <Edit3 className="w-5 h-5 text-blue-400" />;
            case 'add_credits': return <PlusCircle className="w-5 h-5 text-green-400" />;
            case 'subtract_credits': return <MinusCircle className="w-5 h-5 text-orange-400" />;
            case 'set_credits': return <CreditCard className="w-5 h-5 text-purple-400" />;
            case 'delete': return <AlertTriangle className="w-5 h-5 text-red-400" />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col">
            {/* Header / Filter */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="İsim, e-posta, şirket veya telefon ile ara..."
                        className="w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary text-sm font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                        className="h-12 pl-11 pr-8 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary text-sm font-bold appearance-none cursor-pointer min-w-[160px]"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Tüm Durumlar</option>
                        <option value="approved">Aktif / Onaylı</option>
                        <option value="pending">Onay Bekleyen</option>
                        <option value="rejected">Reddedilen</option>
                    </select>
                </div>
            </div>

            {/* Toast Messages */}
            {successMsg && (
                <div className="mx-6 mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
                    <Check className="w-4 h-4" /> {successMsg}
                </div>
            )}
            {errorMsg && (
                <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
                    <X className="w-4 h-4" /> {errorMsg}
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 dark:bg-gray-900/40 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <tr>
                            <th className="px-8 py-4">Bayi Bilgisi</th>
                            <th className="px-8 py-4">İletişim</th>
                            <th className="px-8 py-4">Durum</th>
                            <th className="px-8 py-4">Bakiye</th>
                            <th className="px-8 py-4 text-center">İşlemler</th>
                            <th className="px-8 py-4 text-right">Kayıt Tarihi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-8 py-20 text-center text-gray-400 font-medium">
                                    <User className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                    Kullanıcı bulunamadı.
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/10 flex items-center justify-center text-blue-500 flex-shrink-0 group-hover:scale-110 transition-transform">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-black text-foreground leading-none">{user.name || 'Ad Belirtilmemiş'}</div>
                                                <div className="text-[10px] text-gray-500 font-bold uppercase mt-1 flex items-center gap-1">
                                                    <Building className="w-3 h-3 italic" /> {user.company_name || 'Şirket Belirtilmemiş'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                                <Mail className="w-3 h-3" /> {user.email}
                                            </div>
                                            {user.phone && (
                                                <div className="text-[10px] font-medium text-gray-400 flex items-center gap-1.5">
                                                    <PhoneIcon className="w-3 h-3" /> {user.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            user.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {user.status === 'approved' ? 'Aktif' : user.status === 'pending' ? 'Bekliyor' : 'Reddedildi'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-xl inline-flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-primary" />
                                            <span className="font-black text-primary">{user.credits.toLocaleString()} <span className="text-[10px] opacity-70">CR</span></span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => openModal('add_credits', user)} className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 hover:scale-110 transition-transform" title="Bakiye Ekle"><PlusCircle className="w-4 h-4" /></button>
                                            <button onClick={() => openModal('subtract_credits', user)} className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 hover:scale-110 transition-transform" title="Bakiye Düş"><MinusCircle className="w-4 h-4" /></button>
                                            <button onClick={() => openModal('edit', user)} className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:scale-110 transition-transform" title="Düzenle"><Settings2 className="w-4 h-4" /></button>
                                            <button onClick={() => openModal('delete', user)} className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 hover:scale-110 transition-transform" title="Sil"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right text-[11px] font-bold text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString('tr-TR')}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Overlay */}
            {modal.type && modal.user && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md p-8 animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                    {getModalIcon()}
                                </div>
                                <div>
                                    <h3 className="font-black text-foreground text-xl">{getModalTitle()}</h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase">{modal.user.name}</p>
                                </div>
                            </div>
                            <button onClick={closeModal} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        {modal.type === 'edit' && (
                            <div className="space-y-6">
                                <Input label="Ad Soyad" value={editData.name || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData(p => ({ ...p, name: e.target.value }))} />
                                <Input label="Firma Adı" value={editData.company_name || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData(p => ({ ...p, company_name: e.target.value }))} />
                                <Input label="Telefon" value={editData.phone || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData(p => ({ ...p, phone: e.target.value }))} />
                                <div className="flex gap-4 pt-4">
                                    <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={closeModal} disabled={loading}>İptal</Button>
                                    <Button className="flex-1 h-12 rounded-xl shadow-lg shadow-primary/20" onClick={handleSaveEdit} isLoading={loading}>Kaydet</Button>
                                </div>
                            </div>
                        )}

                        {(modal.type === 'add_credits' || modal.type === 'subtract_credits' || modal.type === 'set_credits') && (
                            <div className="space-y-6">
                                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 text-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mevcut Bakiye</p>
                                    <p className="text-3xl font-black text-foreground">{modal.user.credits.toLocaleString()} CR</p>
                                </div>

                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">
                                        {modal.type === 'add_credits' ? 'Eklenecek Miktar' :
                                            modal.type === 'subtract_credits' ? 'Düşülecek Miktar' : 'Yeni Bakiye'}
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full h-14 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none ring-1 ring-gray-100 dark:ring-gray-800 px-6 text-2xl font-black text-foreground focus:ring-2 focus:ring-primary"
                                        value={creditAmount}
                                        onChange={e => setCreditAmount(e.target.value)}
                                        placeholder="0"
                                        autoFocus
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={closeModal} disabled={loading}>İptal</Button>
                                    <Button
                                        className={`flex-1 h-12 rounded-xl ${modal.type === 'add_credits' ? 'bg-green-600 hover:bg-green-700' :
                                            modal.type === 'subtract_credits' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-purple-600 hover:bg-purple-700'
                                            } text-white font-bold`}
                                        onClick={() => handleCreditAction(modal.type === 'add_credits' ? 'add' : modal.type === 'subtract_credits' ? 'subtract' : 'set')}
                                        isLoading={loading}
                                    >
                                        Onayla
                                    </Button>
                                </div>
                            </div>
                        )}

                        {modal.type === 'delete' && (
                            <div className="space-y-6 text-center">
                                <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                                    <p className="text-sm font-bold text-red-600">Bu işlemi onaylıyor musunuz?</p>
                                    <p className="text-xs text-red-500 mt-2">Bu kullanıcıyı ve tüm geçmişini kalıcı olarak sileceksiniz.</p>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={closeModal} disabled={loading}>İptal</Button>
                                    <Button className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold" onClick={handleDelete} isLoading={loading}>Evet, Sil</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Minimal Input component for modal
function Input({ label, ...props }: any) {
    return (
        <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">{label}</label>
            <input
                className="w-full h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-none ring-1 ring-gray-100 dark:ring-gray-800 px-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary"
                {...props}
            />
        </div>
    );
}
