import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import fs from 'fs';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const vehicle_make = formData.get('vehicle_make') as string;
        const vehicle_model = formData.get('vehicle_model') as string;
        const engine_code = formData.get('engine_code') as string;
        const ecu_type = formData.get('ecu_type') as string;
        const optionsRaw = formData.get('options') as string;
        const selectedOptions = JSON.parse(optionsRaw || '[]') as string[];

        if (!file) {
            return NextResponse.json({ error: 'Dosya yüklenmedi.' }, { status: 400 });
        }

        // Calculate cost based on selected services
        let totalCost = 0;
        if (selectedOptions.length > 0) {
            const placeholders = selectedOptions.map(() => '?').join(',');
            const services = db.prepare(`SELECT price FROM services WHERE name IN (${placeholders})`).all(...selectedOptions) as any[];
            totalCost = services.reduce((sum, s) => sum + s.price, 0);
        }

        // Check user balance
        const user = db.prepare('SELECT credits FROM users WHERE id = ?').get((session as any).id) as any;
        if (user.credits < totalCost) {
            return NextResponse.json({ error: `Yetersiz bakiye. Gerekli: ${totalCost} CR, Mevcut: ${user.credits} CR` }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure uploads directory exists
        const uploadsDir = join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Unique filename: TIMESTAMP_USERID_ORIGINALNAME
        const filename = `${Date.now()}_${(session as any).id}_${file.name}`;
        const filePath = join(uploadsDir, filename);

        await writeFile(filePath, buffer);

        // Transaction for saving file and deducting credits
        const transaction = db.transaction(() => {
            // Deduct credits
            db.prepare('UPDATE users SET credits = credits - ? WHERE id = ?').run(totalCost, (session as any).id);

            // Record transaction
            db.prepare('INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)')
                .run((session as any).id, totalCost, 'debit', `${vehicle_make} ${vehicle_model} için dosya isteği`);

            // Save to DB
            const stmt = db.prepare(`
                INSERT INTO files (user_id, vehicle_make, vehicle_model, engine_code, ecu_type, original_file_path, status, options, cost)
                VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
            `);

            stmt.run((session as any).id, vehicle_make, vehicle_model, engine_code, ecu_type, filePath, optionsRaw || '[]', totalCost);
        });

        transaction();

        return NextResponse.json({ success: true, cost: totalCost });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Sunucu hatası. Dosya yüklenemedi.' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session as any).id;
        const role = (session as any).role;

        let stmt;
        if (role === 'admin') {
            // Admin sees all files
            stmt = db.prepare('SELECT files.*, users.name as user_name FROM files JOIN users ON files.user_id = users.id ORDER BY files.created_at DESC');
            return NextResponse.json(stmt.all());
        } else {
            // Dealer sees only their own
            stmt = db.prepare('SELECT * FROM files WHERE user_id = ? ORDER BY created_at DESC');
            return NextResponse.json(stmt.all(userId));
        }

    } catch (error) {
        console.error('List files error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
