import { PGlite } from '@electric-sql/pglite';
import { faker } from '@faker-js/faker';

export async function seedDatabase(db: PGlite) {
    console.log('Seeding data...');

    // 1. Users
    const users = [
        { id: 'u1', name: 'Alex Manager', email: 'alex@gearguard.com', role: 'manager', job: 'Plant Manager', avatar: faker.image.avatar() },
        { id: 'u2', name: 'Sam Tech', email: 'sam@gearguard.com', role: 'technician', job: 'Senior Mechanic', avatar: faker.image.avatar() },
        { id: 'u3', name: 'Jamie Tech', email: 'jamie@gearguard.com', role: 'technician', job: 'Electrician', avatar: faker.image.avatar() },
    ];

    for (const u of users) {
        await db.query(`INSERT INTO users (id, name, email, role, job_title, avatar) VALUES ($1, $2, $3, $4, $5, $6)`, [u.id, u.name, u.email, u.role, u.job, u.avatar]);
    }

    // 2. Teams
    const teams = [
        { id: 't1', name: 'Mechanical Maintenance', slug: 'mechanical', desc: 'Heavy machinery repairs' },
        { id: 't2', name: 'Electrical Systems', slug: 'electrical', desc: 'Circuits, sensors, and power' },
        { id: 't3', name: 'Production Line 1', slug: 'production-1', desc: 'Main assembly line support' },
    ];

    for (const t of teams) {
        await db.query(`INSERT INTO teams (id, name, slug, description) VALUES ($1, $2, $3, $4)`, [t.id, t.name, t.slug, t.desc]);
    }

    // 3. Equipment (50 items)
    const equipmentIds: string[] = [];
    for (let i = 0; i < 50; i++) {
        const id = faker.string.uuid();
        equipmentIds.push(id);
        const teamId = faker.helpers.arrayElement(teams).id;
        const name = faker.commerce.productName();

        await db.query(`
      INSERT INTO equipment (id, name, serial_number, model, manufacturer, location, status, team_id, image)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
            id,
            name,
            faker.string.alphanumeric(10).toUpperCase(),
            faker.vehicle.model(),
            faker.vehicle.manufacturer(),
            `Zone ${faker.location.buildingNumber()}`,
            faker.helpers.arrayElement(['operational', 'operational', 'operational', 'down', 'maintenance']),
            teamId,
            faker.image.urlLoremFlickr({ category: 'machinery' })
        ]);
    }

    // 4. Tickets & Messages
    for (let i = 0; i < 30; i++) {
        const ticketId = faker.string.uuid();
        const equipId = faker.helpers.arrayElement(equipmentIds);
        const status = faker.helpers.arrayElement(['new', 'in_progress', 'review', 'repaired']);

        await db.query(`
      INSERT INTO tickets (id, title, description, status, priority, type, equipment_id, created_by, assignee_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
            ticketId,
            `${faker.hacker.verb()} ${faker.hacker.noun()}`,
            faker.lorem.sentence(),
            status,
            faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
            'corrective',
            equipId,
            'u1', // Created by Manager usually
            faker.helpers.arrayElement(['u2', 'u3']),
            faker.date.recent({ days: 10 }).toISOString()
        ]);

        // Messages for this ticket
        const msgCount = faker.number.int({ min: 1, max: 5 });
        for (let j = 0; j < msgCount; j++) {
            await db.query(`
        INSERT INTO messages (id, ticket_id, user_id, content, type, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
                faker.string.uuid(),
                ticketId,
                faker.helpers.arrayElement(['u1', 'u2', 'u3']),
                faker.lorem.sentence(),
                'text',
                faker.date.recent({ days: 5 }).toISOString()
            ]);
        }
    }

    console.log('Seeding complete!');
}
