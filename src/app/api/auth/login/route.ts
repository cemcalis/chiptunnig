import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { login } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'E-posta ve şifre zorunludur.' }, { status: 400 });
        }

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

        if (!user) {
            return NextResponse.json({ error: 'E-posta veya şifre hatalı.' }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return NextResponse.json({ error: 'E-posta veya şifre hatalı.' }, { status: 401 });
        }

        // Check approval status (only for dealers)
        if (user.role === 'dealer') {
            if (user.status === 'pending') {
                return NextResponse.json({
                    error: 'Hesabınız henüz onaylanmamış. Admin onayını bekleyin.'
                }, { status: 403 });
            }
            if (user.status === 'rejected') {
                return NextResponse.json({
                    error: `Hesabınız reddedildi.${user.rejection_reason ? ' Sebep: ' + user.rejection_reason : ''}`
                }, { status: 403 });
            }
        }

        // Create session
        await login({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            credits: user.credits,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
    }
}
