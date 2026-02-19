import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET: Admin lists all, Dealer lists own
export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = session as any;

        if (user.role === 'admin') {
            const stmt = db.prepare(`
                SELECT payment_requests.*, users.name as user_name, users.company_name 
                FROM payment_requests 
                JOIN users ON payment_requests.user_id = users.id 
                ORDER BY created_at DESC
            `);
            return NextResponse.json(stmt.all());
        } else {
            const stmt = db.prepare('SELECT * FROM payment_requests WHERE user_id = ? ORDER BY created_at DESC');
            return NextResponse.json(stmt.all(user.id));
        }
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Dealer submits a request
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { amount } = await req.json();
        if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });

        const userId = (session as any).id;

        const stmt = db.prepare('INSERT INTO payment_requests (user_id, amount) VALUES (?, ?)');
        stmt.run(userId, amount);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
