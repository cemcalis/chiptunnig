import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET: List all pending registrations (or all users with status filter)
export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || (session as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status') || 'pending';

        const users = db.prepare(`
            SELECT id, name, company_name, email, phone, status, rejection_reason, created_at, approved_at
            FROM users
            WHERE role = 'dealer' AND status = ?
            ORDER BY created_at DESC
        `).all(status);

        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Approve or reject a user
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || (session as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId, action, reason } = await req.json();
        // action: 'approve' | 'reject'

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const user = db.prepare('SELECT id, status FROM users WHERE id = ?').get(userId) as any;
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (action === 'approve') {
            db.prepare(`
                UPDATE users SET status = 'approved', approved_at = CURRENT_TIMESTAMP, rejection_reason = NULL WHERE id = ?
            `).run(userId);
        } else {
            db.prepare(`
                UPDATE users SET status = 'rejected', rejection_reason = ? WHERE id = ?
            `).run(reason || null, userId);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Approval error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
