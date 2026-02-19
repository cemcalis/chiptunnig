import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import fs from 'fs';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: fileId } = await params;
        const session = await getSession();
        if (!session || (session as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const status = formData.get('status') as string;
        const moddedFile = formData.get('modded_file') as File | null;

        let moddedFilePath = null;

        if (moddedFile) {
            const bytes = await moddedFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const uploadsDir = join(process.cwd(), 'uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            const filename = `MODDED_${Date.now()}_${moddedFile.name}`;
            moddedFilePath = join(uploadsDir, filename);
            await writeFile(moddedFilePath, buffer);
        }

        const updates = [];
        const values = [];

        if (status) {
            updates.push('status = ?');
            values.push(status);
        }

        if (moddedFilePath) {
            updates.push('modded_file_path = ?');
            values.push(moddedFilePath);
            updates.push('updated_at = CURRENT_TIMESTAMP');
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
        }

        values.push(fileId);

        const stmt = db.prepare(`UPDATE files SET ${updates.join(', ')} WHERE id = ?`);
        stmt.run(...values);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Update file error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    // Get single file details
    try {
        const { id: fileId } = await params;
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const stmt = db.prepare('SELECT files.*, users.name as user_name FROM files JOIN users ON files.user_id = users.id WHERE files.id = ?');
        const file = stmt.get(fileId);

        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // Check ownership if not admin
        if ((session as any).role !== 'admin' && (file as any).user_id !== (session as any).id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        return NextResponse.json(file);

    } catch (error) {
        console.error('Get file error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
