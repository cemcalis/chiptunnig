import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password, name, company_name, phone } = body;

        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Ad, e-posta ve şifre zorunludur.' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır.' }, { status: 400 });
        }

        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existing) {
            return NextResponse.json({ error: 'Bu e-posta adresi zaten kayıtlı.' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.prepare(`
            INSERT INTO users (email, password, role, name, company_name, phone, credits, status)
            VALUES (?, ?, 'dealer', ?, ?, ?, 0, 'pending')
        `).run(email, hashedPassword, name, company_name || null, phone || null);

        return NextResponse.json({
            success: true,
            message: 'Başvurunuz alındı. Admin onayından sonra giriş yapabilirsiniz.'
        });
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json({ error: 'Sunucu hatası. Lütfen tekrar deneyin.' }, { status: 500 });
    }
}
