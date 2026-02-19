'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
    Database,
    Search,
    Cpu,
    Car,
    Tag,
    StickyNote,
    ChevronRight,
    AlertCircle,
    Info
} from 'lucide-react';

export default function BoschDatabasePage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.length >= 3) {
                handleSearch();
            } else if (query.length === 0) {
                setResults([]);
                setSearched(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSearch = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/bosch?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data);
                setSearched(true);
            }
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-3xl border border-primary/20">
                        <Database className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-foreground tracking-tight">Bosch Veritabanı</h1>
                        <p className="text-gray-500 font-medium">ECU numarası veya araç bilgisi ile teknik detayları sorgulayın.</p>
                    </div>
                </div>
            </div>

            {/* Search Section */}
            <Card className="p-8 border-none bg-white dark:bg-black shadow-2xl shadow-primary/5 ring-1 ring-gray-100 dark:ring-gray-900 rounded-[2.5rem] overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                        <h2 className="text-xl font-black text-foreground">Hızlı Sorgulama</h2>
                    </div>

                    <div className="relative group">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2">
                            <Search className={`w-6 h-6 transition-colors duration-300 ${query.length >= 3 ? 'text-primary' : 'text-gray-400'}`} />
                        </div>
                        <input
                            type="text"
                            placeholder="Bosch NO (Örn: 0281013328), OEM veya Araç Modeli yazın..."
                            className="w-full h-20 pl-16 pr-6 bg-gray-50 dark:bg-gray-900 border-none rounded-[1.5rem] ring-1 ring-gray-200 dark:ring-gray-800 focus:ring-4 focus:ring-primary/20 text-xl font-bold placeholder:text-gray-400 placeholder:font-normal transition-all"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">Örn: 0281013328</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">Örn: EDC16C2</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">Örn: Volkswagen Golf</span>
                    </div>
                </div>
            </Card>

            {/* Results Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg font-black text-foreground uppercase tracking-tighter">
                        {isLoading ? 'Sonuçlar taranıyor...' : searched ? `${results.length} Sonuç Bulundu` : 'Sorgulama bekleniyor'}
                    </h3>
                    {searched && results.length > 0 && (
                        <div className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                            Veritabanı Güncel
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        [1, 2, 3].map(i => (
                            <Card key={i} className="h-48 bg-gray-50 dark:bg-gray-900 border-none animate-pulse rounded-3xl"></Card>
                        ))
                    ) : results.length > 0 ? (
                        results.map((ecu) => (
                            <Card key={ecu.id} className="p-6 border-none bg-white dark:bg-black shadow-sm ring-1 ring-gray-100 dark:ring-gray-900 rounded-3xl hover:ring-2 hover:ring-primary/30 transition-all group overflow-hidden relative">
                                <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary/5 rounded-tl-[3rem] -mb-10 -mr-10 group-hover:scale-110 transition-transform"></div>

                                <div className="space-y-4 relative z-10">
                                    <div className="flex items-start justify-between">
                                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl text-gray-400 group-hover:text-primary transition-colors">
                                            <Cpu className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-black px-2 py-1 bg-primary/10 text-primary rounded-lg uppercase tracking-tighter">
                                            Teknik Detay
                                        </span>
                                    </div>

                                    <div>
                                        <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Bosch Numarası</div>
                                        <div className="text-xl font-black text-foreground group-hover:text-primary transition-colors">{ecu.bosch_number}</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                                        <div>
                                            <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase mb-1">
                                                <Car className="w-3 h-3" /> Araç / Motor
                                            </div>
                                            <div className="text-xs font-bold text-foreground line-clamp-1">{ecu.vehicle_info || '—'}</div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase mb-1">
                                                <Tag className="w-3 h-3" /> OEM
                                            </div>
                                            <div className="text-xs font-bold text-foreground line-clamp-1">{ecu.oem_number || '—'}</div>
                                        </div>
                                    </div>

                                    {ecu.notes && (
                                        <div className="mt-3 flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                            <StickyNote className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                                            <div className="text-[11px] font-medium text-gray-500 line-clamp-2">{ecu.notes}</div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))
                    ) : searched ? (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-10 h-10" />
                            </div>
                            <h4 className="text-2xl font-black text-foreground mb-2">Eşleşme Bulunamadı</h4>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Yazdığınız numarayı kontrol edin veya daha az karakter yazarak tekrar deneyin.
                                Aradığınız numara henüz veritabanımızda olmayabilir.
                            </p>
                        </div>
                    ) : (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[3rem]">
                            <Info className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-400 font-medium italic">Sorgulamak için yukarıdaki kutuya en az 3 karakter yazın.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                <Card className="p-8 bg-gradient-to-br from-gray-900 to-black text-white border-none rounded-[2rem] relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                            <Cpu className="w-5 h-5 text-primary" />
                        </div>
                        <h4 className="text-xl font-black uppercase italic text-primary">Tuner Teknik Destek</h4>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Aradığınız ECU numarası veritabanında yoksa, dosya yükleme kısmındaki notlar bölümünden veya destek mesajlarından bize numara ile ulaşarak uyumluluk teyidi alabilirsiniz.
                    </p>
                </Card>

                <Card className="p-8 bg-primary/5 border border-primary/20 rounded-[2rem] flex flex-col justify-center">
                    <p className="text-sm font-bold text-foreground leading-relaxed mb-4">
                        Veritabanımızda 10.000+ Bosch ve OEM numarası kayıtlıdır. Tüm numaralar uzman tuner ekibimiz tarafından doğrulanmıştır.
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-black bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                                    U{i}
                                </div>
                            ))}
                        </div>
                        <span className="text-[10px] font-black text-gray-500 uppercase ml-2">GÜNLÜK 500+ SORGULAMA</span>
                    </div>
                </Card>
            </div>
        </div>
    );
}
