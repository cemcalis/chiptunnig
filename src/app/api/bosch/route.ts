import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        if (!query || query.length < 3) {
            return NextResponse.json([]);
        }

        const searchTerm = `%${query}%`;
        const ecus = db.prepare(`
            SELECT * FROM ecus 
            WHERE bosch_number LIKE ? 
            OR oem_number LIKE ? 
            OR vehicle_info LIKE ? 
            OR notes LIKE ? 
            LIMIT 50
        `).all(searchTerm, searchTerm, searchTerm, searchTerm);

        return NextResponse.json(ecus);
    } catch (error) {
        console.error('Bosch search error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
