import { PGlite } from '@electric-sql/pglite';
import { live } from '@electric-sql/pglite/live';
import { schema } from './schema';
import { seedDatabase } from './seed';

// Initialize PGlite instance (persisted to IndexedDB) + Live Extension
export const db = new PGlite('idb://gearguard-db', {
    extensions: { live }
});

export async function initDB() {
    console.log('Initializing Database...');
    try {
        // ALWAYS Run Schema to ensure latest structure (It includes DROPs for dev mode)
        await db.exec(schema);

        // Check if seeded (users count)
        const result = await db.query('SELECT count(*) from users');
        const userCount = result.rows[0]?.count;

        if (Number(userCount) === 0) {
            console.log('Database empty/reset, seeding...');
            await seedDatabase(db);
            console.log('Database seeded!');
        } else {
            // For V2 dev, since we want to force the new seed data structure, 
            // we might want to drop if schema ran but didn't clear data? 
            // Actually, the Schema file has DROP TABLE commands at the top.
            // So running `db.exec(schema)` WIPES the data.
            // Thus, userCount will be 0 after line 13.
            // So this logic naturally falls through to re-seed.
            console.log('Schema applied (Data wiped for V2 dev). Re-seeding...');
            await seedDatabase(db);
        }
    } catch (err) {
        console.error('Failed to initialize DB:', err);
    }
}
