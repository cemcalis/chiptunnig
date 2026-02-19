import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

// POST: User requests credits (creates a payment_request, requires admin approval)
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { amount } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Geçersiz miktar' }, { status: 400 });
        }

        const userId = (session as any).id;

        // Create a payment request instead of directly adding credits
        db.prepare('INSERT INTO payment_requests (user_id, amount) VALUES (?, ?)').run(userId, amount);

        return NextResponse.json({
            success: true,
            message: 'Bakiye yükleme talebiniz alındı. Admin onayından sonra hesabınıza yüklenecektir.'
        });

    } catch (error) {
        console.error('Credit request error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session as any).id;

        const transactions = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(userId);
        const user = db.prepare('SELECT credits FROM users WHERE id = ?').get(userId) as any;
        const pendingRequests = db.prepare("SELECT * FROM payment_requests WHERE user_id = ? AND status = 'pending' ORDER BY created_at DESC").all(userId);

        return NextResponse.json({
            transactions,
            balance: user?.credits || 0,
            pendingRequests
        });

    } catch (error) {
        console.error('Transaction fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
