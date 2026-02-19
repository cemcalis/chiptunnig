import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || (session as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, action } = await req.json(); // action: 'approve' | 'reject'

        if (action !== 'approve' && action !== 'reject') {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const requestStmt = db.prepare('SELECT * FROM payment_requests WHERE id = ?');
        const request = requestStmt.get(id) as any;

        if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        if (request.status !== 'pending') return NextResponse.json({ error: 'Request already processed' }, { status: 400 });

        const updateStmt = db.prepare('UPDATE payment_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');

        const tx = db.transaction(() => {
            updateStmt.run(action === 'approve' ? 'approved' : 'rejected', id);

            if (action === 'approve') {
                // Add credits to user
                db.prepare('UPDATE users SET credits = credits + ? WHERE id = ?').run(request.amount, request.user_id);

                // Log transaction
                db.prepare(`
                    INSERT INTO transactions (user_id, amount, type, description)
                    VALUES (?, ?, 'deposit', ?)
                `).run(request.user_id, request.amount, `Bank Transfer Approved #${id}`);
            }
        });

        tx();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
