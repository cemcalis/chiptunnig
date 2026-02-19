import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

// POST: Admin adds/removes/sets credits for a user
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || (session as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { action, amount } = body;
        // action: 'add' | 'subtract' | 'set'

        if (!['add', 'subtract', 'set'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action. Use add, subtract, or set.' }, { status: 400 });
        }

        if (typeof amount !== 'number' || amount < 0) {
            return NextResponse.json({ error: 'Amount must be a non-negative number.' }, { status: 400 });
        }

        const userStmt = db.prepare('SELECT * FROM users WHERE id = ?');
        const user = userStmt.get(id) as any;

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const adminId = (session as any).id;

        const tx = db.transaction(() => {
            let newCredits = user.credits;
            let transactionType = 'admin_adjustment';
            let description = '';

            if (action === 'add') {
                newCredits = user.credits + amount;
                transactionType = 'admin_add';
                description = `Admin tarafından ${amount} kredi eklendi`;
            } else if (action === 'subtract') {
                newCredits = Math.max(0, user.credits - amount);
                const actualSubtracted = user.credits - newCredits;
                transactionType = 'admin_subtract';
                description = `Admin tarafından ${actualSubtracted} kredi düşüldü`;
            } else if (action === 'set') {
                newCredits = amount;
                transactionType = 'admin_set';
                description = `Admin tarafından bakiye ${amount} olarak ayarlandı`;
            }

            db.prepare('UPDATE users SET credits = ? WHERE id = ?').run(newCredits, id);

            db.prepare(`
                INSERT INTO transactions (user_id, amount, type, description)
                VALUES (?, ?, ?, ?)
            `).run(id, action === 'subtract' ? -(user.credits - newCredits) : newCredits - user.credits, transactionType, description);

            return newCredits;
        });

        const newCredits = tx();

        return NextResponse.json({ success: true, newCredits });

    } catch (error) {
        console.error('Admin credits error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
