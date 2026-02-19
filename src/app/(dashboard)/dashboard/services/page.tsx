import { Card } from '@/components/ui/Card';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DollarSign, Tag } from 'lucide-react';

const CATEGORIES: Record<string, string> = {
    performans: 'Performans',
    emisyon: 'Emisyon',
    guvenlik: 'Güvenlik',
    sorgulama: 'Sorgulama',
    diger: 'Diğer',
    genel: 'Genel',
};

export default async function ServicesPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const services = db.prepare("SELECT * FROM services WHERE is_active = 1 ORDER BY category, name").all() as any[];

    // Group by category
    const grouped = services.reduce((acc: Record<string, any[]>, svc) => {
        const cat = svc.category || 'genel';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(svc);
        return acc;
    }, {});

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Hizmet Fiyat Listesi</h1>
                <p className="text-gray-500 mt-1">Mevcut tuning hizmetleri ve güncel fiyatlar.</p>
            </div>

            {Object.keys(grouped).length === 0 ? (
                <Card className="p-12 text-center border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                    <p className="text-gray-400">Henüz hizmet tanımlanmamış.</p>
                </Card>
            ) : (
                Object.entries(grouped).map(([category, svcs]) => (
                    <Card key={category} className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-primary" />
                            <h2 className="font-bold text-gray-800 dark:text-gray-200">
                                {CATEGORIES[category] || category}
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {svcs.map((svc: any) => (
                                <div key={svc.id} className="px-6 py-4 flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">{svc.name}</div>
                                        {svc.description && (
                                            <div className="text-xs text-gray-500 mt-0.5">{svc.description}</div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 px-3 py-1.5 rounded-xl flex-shrink-0">
                                        <DollarSign className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                        <span className="font-bold text-green-700 dark:text-green-400">{svc.price} ₺</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))
            )}
        </div>
    );
}
