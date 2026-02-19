import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET: Current user profile
export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userId = (session as any).id;
        const user = db.prepare('SELECT id, email, name, company_name, phone, role, credits, created_at FROM users WHERE id = ?').get(userId);

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH: Update profile
export async function PATCH(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userId = (session as any).id;
        const body = await req.json();
        const { name, company_name, phone, currentPassword, newPassword } = body;

        // Verify user exists
        const user = db.prepare('SELECT password FROM users WHERE id = ?').get(userId) as any;
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Update basic info
        db.prepare('UPDATE users SET name = ?, company_name = ?, phone = ? WHERE id = ?')
            .run(name, company_name, phone, userId);

        // Handle password change if requested
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ error: 'Mevcut şifrenizi girmelisiniz.' }, { status: 400 });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return NextResponse.json({ error: 'Mevcut şifre hatalı.' }, { status: 400 });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, userId);
        }

        return NextResponse.json({ success: true, message: 'Profil güncellendi.' });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Sistem hatası oluştu.' }, { status: 500 });
    }
}
