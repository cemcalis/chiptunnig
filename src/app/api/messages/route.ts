import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET: Get messages for a conversation
// Admin: GET /api/messages?userId=X (conversation with user X)
// User: GET /api/messages (own conversation with admin)
export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const currentUser = session as any;
        const { searchParams } = new URL(req.url);

        let targetUserId: number;

        if (currentUser.role === 'admin') {
            const userId = searchParams.get('userId');
            if (!userId) {
                // Return list of users who have messaged
                const conversations = db.prepare(`
                    SELECT 
                        u.id, u.name, u.company_name, u.email,
                        (SELECT COUNT(*) FROM direct_messages WHERE user_id = u.id AND sender_role = 'user' AND is_read = 0) as unread_count,
                        (SELECT created_at FROM direct_messages WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
                        (SELECT message FROM direct_messages WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as last_message
                    FROM users u
                    WHERE u.role = 'dealer' AND u.status = 'approved'
                    AND EXISTS (SELECT 1 FROM direct_messages WHERE user_id = u.id)
                    ORDER BY last_message_at DESC
                `).all();
                return NextResponse.json(conversations);
            }
            targetUserId = parseInt(userId);
        } else {
            targetUserId = currentUser.id;
        }

        // Mark admin messages as read when user views them
        if (currentUser.role !== 'admin') {
            db.prepare(`UPDATE direct_messages SET is_read = 1 WHERE user_id = ? AND sender_role = 'admin'`).run(targetUserId);
        } else {
            // Mark user messages as read when admin views them
            db.prepare(`UPDATE direct_messages SET is_read = 1 WHERE user_id = ? AND sender_role = 'user'`).run(targetUserId);
        }

        const messages = db.prepare(`
            SELECT * FROM direct_messages
            WHERE user_id = ?
            ORDER BY created_at ASC
        `).all(targetUserId);

        return NextResponse.json(messages);
    } catch (error) {
        console.error('Get messages error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Send a message
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const currentUser = session as any;
        const body = await req.json();
        const { message, userId } = body;

        if (!message?.trim()) {
            return NextResponse.json({ error: 'Mesaj boş olamaz.' }, { status: 400 });
        }

        let targetUserId: number;
        let senderRole: 'user' | 'admin';

        if (currentUser.role === 'admin') {
            if (!userId) {
                return NextResponse.json({ error: 'userId required for admin' }, { status: 400 });
            }
            targetUserId = parseInt(userId);
            senderRole = 'admin';
        } else {
            targetUserId = currentUser.id;
            senderRole = 'user';
        }

        db.prepare(`
            INSERT INTO direct_messages (user_id, sender_role, message, is_read)
            VALUES (?, ?, ?, ?)
        `).run(targetUserId, senderRole, message.trim(), senderRole === 'admin' ? 0 : 0);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Send message error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
