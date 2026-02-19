const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(process.cwd(), 'data/tuning.db'));

console.log('Seeding massive Bosch Database...');

const makes = ['Audi', 'BMW', 'Volkswagen', 'Mercedes', 'Ford', 'Opel', 'Renault', 'Peugeot', 'Fiat', 'Volvo'];
const models = {
    'Audi': ['A3', 'A4', 'A6', 'Q5', 'Q7'],
    'BMW': ['320d', '530d', 'X5', '118d', 'M3'],
    'Volkswagen': ['Golf', 'Passat', 'Tiguan', 'Caddy', 'Touareg'],
    'Mercedes': ['C220', 'E350', 'Sprinter', 'A180', 'S500'],
    'Ford': ['Focus', 'Mondeo', 'Transit', 'Fiesta', 'Ranger'],
    'Opel': ['Astra', 'Insignia', 'Corsa', 'Vivaro', 'Mokka'],
    'Renault': ['Clio', 'Megane', 'Master', 'Trafic', 'Captur'],
    'Peugeot': ['308', '508', '3008', 'Partner', 'Boxer'],
    'Fiat': ['Ducato', 'Doblo', '500', 'Tipo', 'Panda'],
    'Volvo': ['XC90', 'XC60', 'V60', 'S90', 'V40']
};
const ecus = ['EDC15', 'EDC16U1', 'EDC16U34', 'EDC17C46', 'EDC17C64', 'EDC17CP14', 'MD1CS001', 'MG1CS002', 'PCR2.1', 'SID208', 'SID807'];

// Clear existing
db.prepare('DELETE FROM ecus').run();

const stmt = db.prepare(`
    INSERT INTO ecus (bosch_number, oem_number, vehicle_info, price)
    VALUES (?, ?, ?, ?)
`);

const transaction = db.transaction(() => {
    // Generate 2000 realistic entries
    for (let i = 0; i < 2000; i++) {
        const make = makes[Math.floor(Math.random() * makes.length)];
        const model = models[make][Math.floor(Math.random() * models[make].length)];
        const ecu = ecus[Math.floor(Math.random() * ecus.length)];
        const hp = 100 + Math.floor(Math.random() * 200);

        // Generate random Bosch number (e.g., 0 281 013 328)
        const bosch = `0281${Math.floor(100000 + Math.random() * 900000)}`;
        // Generate random OEM
        const oem = `${Math.floor(Math.random() * 9)}${String.fromCharCode(65 + Math.random() * 26)}${Math.floor(1000 + Math.random() * 9000)}`;

        const vehicleInfo = `${make} ${model} 2.0 TDI ${hp}HP ${ecu}`;
        const price = 100 + Math.floor(Math.random() * 300); // 100 - 400 EUR

        try {
            stmt.run(bosch, oem, vehicleInfo, price);
        } catch (e) {
            // Ignore duplicates
        }
    }
});

transaction();

console.log('Successfully seeded 2000 Bosch ECU entries.');
