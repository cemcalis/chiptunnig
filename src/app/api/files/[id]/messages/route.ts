import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET all messages for a specific file
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: fileId } = await params;
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userId = (session as any).id;
        const userRole = (session as any).role;

        // Verify access to file
        const fileStmt = db.prepare('SELECT user_id FROM files WHERE id = ?');
        const file = fileStmt.get(fileId) as any;

        if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 });

        // Only Admin or the File Owner can read messages
        if (userRole !== 'admin' && file.user_id !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const stmt = db.prepare(`
            SELECT messages.*, users.name as user_name, users.role as user_role 
            FROM messages 
            JOIN users ON messages.user_id = users.id 
            WHERE file_id = ? 
            ORDER BY created_at ASC
        `);
        const messages = stmt.all(fileId);

        return NextResponse.json(messages);
    } catch (error) {
        console.error('Fetch messages error:', error);
        return NextResponse.json({ error: 'Internal User Error' }, { status: 500 });
    }
}

// POST a new message
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: fileId } = await params;
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { message } = await req.json();
        if (!message || !message.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 });

        const userId = (session as any).id;

        // Insert message
        const stmt = db.prepare('INSERT INTO messages (file_id, user_id, message) VALUES (?, ?, ?)');
        const info = stmt.run(fileId, userId, message);

        return NextResponse.json({ success: true, id: info.lastInsertRowid });
    } catch (error) {
        console.error('Send message error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
