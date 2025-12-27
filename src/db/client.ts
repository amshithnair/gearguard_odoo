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
        // 1. Run Schema
        await db.exec(schema);

        // 2. Check if seeded
        const result = await db.query('SELECT count(*) from users');
        const userCount = result.rows[0]?.count;

        // 3. Seed if empty
        if (Number(userCount) === 0) {
            console.log('Database empty, seeding...');
            await seedDatabase(db);
            console.log('Database seeded!');
        } else {
            console.log('Database already initialized.');
        }
    } catch (err) {
        console.error('Failed to initialize DB:', err);
    }
}
