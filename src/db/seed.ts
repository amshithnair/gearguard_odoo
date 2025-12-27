import { PGlite } from '@electric-sql/pglite';
import { faker } from '@faker-js/faker';

export async function seedDatabase(db: PGlite) {
    console.log('Seeding data (ISA-95 & Pulse)...');

    // 1. Users
    const users = [
        { id: 'u1', name: 'Alex Manager', email: 'alex@gearguard.com', role: 'manager', job: 'Plant Manager', avatar: faker.image.avatar() },
        { id: 'u2', name: 'Sam Tech', email: 'sam@gearguard.com', role: 'technician', job: 'Senior Mechanic', avatar: faker.image.avatar() },
        { id: 'u3', name: 'Jamie Tech', email: 'jamie@gearguard.com', role: 'technician', job: 'Electrician', avatar: faker.image.avatar() },
    ];

    for (const u of users) {
        await db.query(`INSERT INTO users (id, name, email, role, job_title, avatar) VALUES ($1, $2, $3, $4, $5, $6)`, [u.id, u.name, u.email, u.role, u.job, u.avatar]);
    }

    // 2. Maintenance Teams
    const teams = [
        { id: 't1', name: 'Mechanical Maintenance', manager: 'u1', desc: 'Heavy machinery repairs' },
        { id: 't2', name: 'Electrical Systems', manager: 'u1', desc: 'Circuits, sensors, and power' },
        { id: 't3', name: 'IT Support', manager: 'u1', desc: 'SCADA and Software' },
    ];
    for (const t of teams) {
        await db.query(`INSERT INTO maintenance_teams (id, name, lead_manager_id, description) VALUES ($1, $2, $3, $4)`, [t.id, t.name, t.manager, t.desc]);
    }

    // 3. Asset Hierarchy (ISA-95)
    // Enterprise (Implicit) -> Site -> Area -> Work Center
    const sites = [{ id: 'site1', name: 'Ahmedabad Plant', type: 'Site', parent: null }];
    const areas = [
        { id: 'area1', name: 'Production Hall A', type: 'Area', parent: 'site1' },
        { id: 'area2', name: 'Utility Building', type: 'Area', parent: 'site1' }
    ];
    const workCenters = [
        { id: 'wc1', name: 'CNC Bay', type: 'Work Center', parent: 'area1' },
        { id: 'wc2', name: 'Assembly Line 1', type: 'Work Center', parent: 'area1' },
        { id: 'wc3', name: 'Generator Room', type: 'Work Center', parent: 'area2' }
    ];

    const hierarchy = [...sites, ...areas, ...workCenters];
    for (const node of hierarchy) {
        await db.query(`INSERT INTO asset_hierarchy (id, name, level_type, parent_id) VALUES ($1, $2, $3, $4)`, [node.id, node.name, node.type, node.parent]);
    }

    // 4. Equipment
    const equipmentList = [
        {
            id: 'eq1', name: 'CNC Machine 01', serial: 'CNC-XH-001', hierarchy: 'wc1',
            team: 't1', model: 'X-2000', mfg: 'Siemens', status: 'Active',
            image: 'https://images.unsplash.com/photo-1565439396687-a365dfc2e56c?q=80&w=1000&auto=format&fit=crop'
        },
        {
            id: 'eq2', name: 'Conveyor Belt 04', serial: 'CV-BL-04', hierarchy: 'wc2',
            team: 't1', model: 'BeltMaster 500', mfg: 'Bosch', status: 'Active',
            image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop'
        },
        {
            id: 'eq3', name: 'Diesel Ben 500kVA', serial: 'DG-500-01', hierarchy: 'wc3',
            team: 't2', model: 'PowerGen', mfg: 'Caterpillar', status: 'Under Maintenance',
            image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1000&auto=format&fit=crop'
        }
    ];

    for (const eq of equipmentList) {
        await db.query(`
            INSERT INTO equipment (
                id, name, serial_number, asset_hierarchy_id, 
                assigned_team_id, model, manufacturer, status, image, 
                location_description, purchase_date, warranty_expiry_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Floor 1', NOW() - INTERVAL '2 years', NOW() + INTERVAL '3 years')
        `, [eq.id, eq.name, eq.serial, eq.hierarchy, eq.team, eq.model, eq.mfg, eq.status, eq.image]);
    }

    // 5. Maintenance Triggers (The "Rules")
    // Rule for CNC Machine: Temp > 80 -> Ticket
    await db.query(`
        INSERT INTO maintenance_triggers (id, equipment_id, trigger_name, parameter_type, threshold_value, operation_type, associated_task_template)
        VALUES 
        ('tr1', 'eq1', 'Overheating Check', 'Temperature', 80, 'Greater_Than', 'Check Coolant System'),
        ('tr2', 'eq3', 'Oil Change Interval', 'Running_Hours', 500, 'Greater_Than', 'Perform 500h Service')
    `);

    // 6. Tickets
    const tickets = [
        {
            id: 'tk1', title: 'Leaking Oil', desc: 'Oil puddle seen under unit',
            equip: 'eq2', type: 'Corrective', stage: 'New', prio: 'Medium',
            team: 't1', tech: 'u2'
        },
        {
            id: 'tk2', title: 'Preventive: Monthly Check', desc: 'Standard inspection',
            equip: 'eq1', type: 'Preventive', stage: 'repaired', prio: 'Low',
            team: 't1', tech: 'u3'
        }
    ];

    for (const t of tickets) {
        await db.query(`
            INSERT INTO tickets (
                id, title, description, equipment_id, request_type, stage, priority, 
                assigned_team_id, assigned_technician_id, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'u1')
        `, [t.id, t.title, t.desc, t.equip, t.type, t.stage, t.prio, t.team, t.tech]);
    }

    console.log('Seeding complete!');
}
