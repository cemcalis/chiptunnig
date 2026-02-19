import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET: List all services (all users can see)
export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const services = db.prepare('SELECT * FROM services ORDER BY category, name').all();
        return NextResponse.json(services);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Create a new service (admin only)
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || (session as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, description, price, category } = await req.json();

        if (!name || price === undefined || price < 0) {
            return NextResponse.json({ error: 'Servis adı ve fiyatı zorunludur.' }, { status: 400 });
        }

        const result = db.prepare(`
            INSERT INTO services (name, description, price, category)
            VALUES (?, ?, ?, ?)
        `).run(name, description || null, price, category || 'genel') as any;

        return NextResponse.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        console.error('Create service error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
