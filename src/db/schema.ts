export const schema = `
  -- Development Mode: DROP tables to ensure schema matches latest wireframes
  DROP TABLE IF EXISTS messages;
  DROP TABLE IF EXISTS tickets;
  DROP TABLE IF EXISTS equipment;
  DROP TABLE IF EXISTS work_centers;
  DROP TABLE IF EXISTS teams;
  DROP TABLE IF EXISTS users;

  CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('manager', 'technician')),
    avatar TEXT,
    job_title TEXT
  );

    -- New ISA-95 & Trigger Tables
    DROP TABLE IF EXISTS machine_telemetry_log;
    DROP TABLE IF EXISTS maintenance_triggers;
    DROP TABLE IF EXISTS asset_hierarchy;
    DROP TABLE IF EXISTS maintenance_teams;

    CREATE TABLE maintenance_teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL, -- e.g. "HVAC", "IT", "Mechanical"
        lead_manager_id TEXT REFERENCES users(id),
        description TEXT
    );

    CREATE TABLE asset_hierarchy (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL, -- e.g. "Ahmedabad Plant", "Production Hall A"
        level_type TEXT NOT NULL CHECK (level_type IN ('Site', 'Area', 'Work Center')),
        parent_id TEXT REFERENCES asset_hierarchy(id)
    );

    CREATE TABLE maintenance_triggers (
        id TEXT PRIMARY KEY,
        equipment_id TEXT, -- FK added after equipment table existence or loose link
        trigger_name TEXT NOT NULL, -- e.g. "500 Hr Oil Change"
        parameter_type TEXT NOT NULL CHECK (parameter_type IN ('Running_Hours', 'Temperature', 'Vibration', 'Cycle_Count')),
        threshold_value NUMERIC NOT NULL,
        operation_type TEXT NOT NULL CHECK (operation_type IN ('Greater_Than', 'Less_Than')),
        associated_task_template TEXT
    );

    CREATE TABLE machine_telemetry_log (
        id TEXT PRIMARY KEY,
        equipment_id TEXT, -- FK added later
        reading_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        parameter_type TEXT NOT NULL,
        value NUMERIC NOT NULL,
        processed_flag BOOLEAN DEFAULT FALSE
    );

    CREATE TABLE equipment (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        serial_number TEXT,
        asset_hierarchy_id TEXT REFERENCES asset_hierarchy(id), -- Linked to physical location
        department TEXT,
        manufacturer TEXT,
        purchase_date TIMESTAMP,
        warranty_expiry_date TIMESTAMP,
        location_description TEXT,
        assigned_team_id TEXT REFERENCES maintenance_teams(id),
        assigned_technician_id TEXT REFERENCES users(id),
        status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Scrapped', 'Under Maintenance')),
        image TEXT,
        model TEXT
    );

    -- Add FKs to triggers and logs now that equipment exists
    -- Note: PGlite might not support ALTER TABLE ADD CONSTRAINT well in one go, but simple references work in CREATE. 
    -- Since we dropped tables above, we can just recreate them with references if we order correctly.
    -- But for simplicity in this script, we'll assume loose coupling or re-create order if needed.
    -- Actually, let's just keep the references inside CREATE for safety.
    -- We can drop and recreate triggers/logs AFTER equipment to get the FK validation if strict.
    -- For now, loose text or re-ordering manually in this string:
    
    -- (Re-defining triggers/logs to have FKs if strict ordering is preferred, but let's trust standard SQL behavior or just omit constraint if complex circularity. 
    -- Hierarchy is simple: Hierarchy -> Equipment. Triggers -> Equipment.
    
    DROP TABLE IF EXISTS maintenance_triggers;
    CREATE TABLE maintenance_triggers (
        id TEXT PRIMARY KEY,
        equipment_id TEXT REFERENCES equipment(id) ON DELETE CASCADE,
        trigger_name TEXT NOT NULL,
        parameter_type TEXT NOT NULL,
        threshold_value NUMERIC NOT NULL,
        operation_type TEXT NOT NULL,
        associated_task_template TEXT
    );

    DROP TABLE IF EXISTS machine_telemetry_log;
    CREATE TABLE machine_telemetry_log (
        id TEXT PRIMARY KEY,
        equipment_id TEXT REFERENCES equipment(id) ON DELETE CASCADE,
        reading_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        parameter_type TEXT NOT NULL,
        value NUMERIC NOT NULL,
        processed_flag BOOLEAN DEFAULT FALSE
    );

  CREATE TABLE tickets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL, -- "Subject" in prompt
    description TEXT,
    equipment_id TEXT REFERENCES equipment(id),
    request_type TEXT NOT NULL DEFAULT 'Corrective' CHECK (request_type IN ('Corrective', 'Preventive', 'Condition_Based')),
    stage TEXT NOT NULL DEFAULT 'New' CHECK (stage IN ('New', 'In Progress', 'Repaired', 'Scrap')),
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    
    assigned_team_id TEXT REFERENCES maintenance_teams(id),
    assigned_technician_id TEXT REFERENCES users(id),
    created_by TEXT REFERENCES users(id),
    
    scheduled_date TIMESTAMP,
    duration_hours NUMERIC DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    ticket_id TEXT REFERENCES tickets(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id),
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;
