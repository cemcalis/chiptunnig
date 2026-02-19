const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(process.cwd(), 'data', 'tuning.db'));

const ecus = [
    { bosch: '0281013328', oem: 'A6461501472', vehicle: 'Mercedes W211 220 CDI', notes: 'EDC16C2' },
    { bosch: '0281013325', oem: 'A6461501172', vehicle: 'Mercedes Sprinter 315 CDI', notes: 'EDC16C31' },
    { bosch: '0281011328', oem: '55196238', vehicle: 'Fiat Doblo 1.3 Multijet', notes: 'MJD 6JF' },
    { bosch: '0281010144', oem: '038906012F', vehicle: 'VW Golf 4 1.9 TDI', notes: 'MSA15' },
    { bosch: '0261208920', oem: '7548231', vehicle: 'BMW E90 320i', notes: 'MEV946' },
    { bosch: '0281012190', oem: '55198058', vehicle: 'Opel Astra H 1.9 CDTI', notes: 'EDC16C39' },
    { bosch: '0281014444', oem: '1356789', vehicle: 'Ford Focus 1.6 TDCi', notes: 'EDC16C34' },
    { bosch: '0281001920', oem: '038906018GQ', vehicle: 'Audi A4 1.9 TDI', notes: 'EDC15P' }
];

const insert = db.prepare('INSERT OR IGNORE INTO ecus (bosch_number, oem_number, vehicle_info, notes) VALUES (?, ?, ?, ?)');

const transaction = db.transaction((data) => {
    for (const ecu of data) {
        insert.run(ecu.bosch, ecu.oem, ecu.vehicle, ecu.notes);
    }
});

transaction(ecus);
console.log('ECU Sample data seeded successfully.');
