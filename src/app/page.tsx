import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Cpu, Zap, ShieldCheck, Gauge } from 'lucide-react';

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
            {/* Hero Section */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-background to-background z-0"></div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 z-0 bg-repeat"></div>

                <div className="relative z-10 text-center max-w-4xl px-4">
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-gray-500 to-gray-700 dark:from-white dark:via-gray-200 dark:to-gray-500">
                        TUNING<span className="text-primary">PORTAL</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
                        Otomotiv Bayileri İçin Profesyonel ECU Remapping & Dosya Hizmeti.
                        Her aracın gerçek potansiyelini ortaya çıkarın.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/login">
                            <Button size="lg" className="px-8 text-lg shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                                Bayi Girişi
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button variant="outline" size="lg" className="px-8 text-lg">
                                Bayi Olun
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-4 bg-secondary dark:bg-secondary-dark relative">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FeatureCard
                        icon={<Cpu className="w-10 h-10 text-primary" />}
                        title="Premium Dosyalar"
                        description="Stage 1, Stage 2 ve Özel kurulumlar için dyno testli yazılım dosyaları."
                    />
                    <FeatureCard
                        icon={<Zap className="w-10 h-10 text-primary" />}
                        title="Hızlı Teslimat"
                        description="Dosyalarınızı dakikalar içinde alın, 7/24 otomatik hizmet mevcuttur."
                    />
                    <FeatureCard
                        icon={<ShieldCheck className="w-10 h-10 text-primary" />}
                        title="Güvenli & Sağlam"
                        description="Her hizmette checksum düzeltme ve dosya doğrulama dahildir."
                    />
                    <FeatureCard
                        icon={<Gauge className="w-10 h-10 text-primary" />}
                        title="Bosch Veritabanı"
                        description="Devasa Bosch ECU parça numarası veritabanımıza özel erişim."
                    />
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-gray-200 dark:border-gray-900 text-center text-gray-500">
                <p>© 2026 TuningPortal. Tüm hakları saklıdır.</p>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <Card className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-gray-200 dark:border-gray-800 bg-white dark:bg-black/50">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400">{description}</p>
        </Card>
    );
}
