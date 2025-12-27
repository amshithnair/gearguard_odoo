"""
Seed script to populate the database with test data
Usage: python manage.py shell < seed_data.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import (
    User, MaintenanceTeam, AssetHierarchy, Equipment,
    MaintenanceTrigger, MachineTelemetryLog, Ticket, Message
)
from django.utils import timezone
from faker import Faker
from datetime import timedelta
import random

fake = Faker()

# Clear existing data (optional - comment out if you don't want to clear)
print("Clearing existing data...")
Message.objects.all().delete()
Ticket.objects.all().delete()
MachineTelemetryLog.objects.all().delete()
MaintenanceTrigger.objects.all().delete()
Equipment.objects.all().delete()
AssetHierarchy.objects.all().delete()
MaintenanceTeam.objects.all().delete()
User.objects.filter(is_superuser=False).delete()

print("Creating users...")
# Create admin user
admin = User.objects.create_superuser(
    username='admin',
    email='admin@gearguard.com',
    password='admin123',
    first_name='Admin',
    last_name='User',
    role='admin',
    job_title='System Administrator'
)

# Create managers
managers = []
for i in range(3):
    manager = User. objects.create_user(
        username=f'manager{i+1}',
        email=fake.email(),
        password='password123',
        first_name=fake.first_name(),
        last_name=fake.last_name(),
        role='manager',
        job_title='Maintenance Manager'
    )
    managers.append(manager)

# Create technicians
technicians = []
for i in range(10):
    tech = User.objects.create_user(
        username=f'tech{i+1}',
        email=fake.email(),
        password='password123',
        first_name=fake.first_name(),
        last_name=fake.last_name(),
        role='technician',
        job_title=random.choice(['Mechanic', 'Electrician', 'HVAC Technician', 'IT Specialist'])
    )
    technicians.append(tech)

print(f"Created {len(managers)} managers and {len(technicians)} technicians")

# Create maintenance teams
print("Creating maintenance teams...")
team_names = ['Mechanical', 'Electrical', 'HVAC', 'IT Support', 'Production Maintenance']
teams = []
for name in team_names:
    team = MaintenanceTeam.objects.create(
        name=name,
        lead_manager=random.choice(managers),
        description=f'{name} maintenance team'
    )
    teams.append(team)

print(f"Created {len(teams)} teams")

# Create asset hierarchy (ISA-95)
print("Creating asset hierarchy...")
sites = []
areas = []
work_centers = []

# Create sites
site_names = ['Main Plant', 'Assembly Facility', 'Warehouse']
for name in site_names:
    site = AssetHierarchy.objects.create(
        name=name,
        level_type='Site'
    )
    sites.append(site)
    
    # Create areas for each site
    for i in range(2):
        area = AssetHierarchy.objects.create(
            name=f'{name} - {random.choice(["Production Hall", "Assembly Area", "Storage Zone"])} {i+1}',
            level_type='Area',
            parent=site
        )
        areas.append(area)
        
        # Create work centers for each area
        for j in range(3):
            wc = AssetHierarchy.objects.create(
                name=f'Line {j+1}',
                level_type='Work Center',
                parent=area
            )
            work_centers.append(wc)

print(f"Created {len(sites)} sites, {len(areas)} areas, {len(work_centers)} work centers")

# Create equipment
print("Creating equipment...")
equipment_list = []
equipment_types = [
    ('CNC Machine', 'Haas', 'VF-2SS'),
    ('Lathe', 'Okuma', 'LB-3000'),
    ('Conveyor Belt', 'Dorner', '2200'),
    ('Air Compressor', 'Atlas Copco', 'GA-30'),
    ('HVAC Unit', 'Carrier', '50TCQ'),
    ('Generator', 'Caterpillar', 'C15'),
    ('Robotic Arm', 'FANUC', 'M-20iA'),
    ('Welder', 'Miller', 'Syncrowave'),
]

for i in range(50):
    eq_type = random.choice(equipment_types)
    equipment = Equipment.objects.create(
        name=f'{eq_type[0]} #{i+1}',
        serial_number=f'SN-{fake.bothify(text="????-####")}',
        model=eq_type[2],
        manufacturer=eq_type[1],
        asset_hierarchy=random.choice(work_centers),
        location_description=fake.address().split('\n')[0],
        department=random.choice(['Production', 'Assembly', 'Packaging', 'Quality Control']),
        status=random.choice(['Active', 'Active', 'Active', 'Under Maintenance', 'Scrapped']),
        health_score=random.randint(60, 100),
        assigned_team=random.choice(teams),
        assigned_technician=random.choice(technicians),
        purchase_date=fake.date_between(start_date='-5y', end_date='-1y'),
        warranty_expiry_date=fake.date_between(start_date='-1y', end_date='+2y'),
        last_maintenance=fake.date_time_between(start_date='-30d', end_date='now'),
        next_maintenance=fake.date_time_between(start_date='now', end_date='+60d'),
        description=fake.text(max_nb_chars=200)
    )
    equipment_list.append(equipment)

print(f"Created {len(equipment_list)} equipment items")

# Create maintenance triggers
print("Creating maintenance triggers...")
triggers_count = 0
for eq in random.sample(equipment_list, 20):
    for _ in range(random.randint(1, 3)):
        param = random.choice(['Temperature', 'Vibration', 'Running_Hours', 'Cycle_Count'])
        MaintenanceTrigger.objects.create(
            equipment=eq,
            trigger_name=f'{param} Alert - {eq.name}',
            parameter_type=param,
            operation_type=random.choice(['Greater_Than', 'Less_Than']),
            threshold_value=random.randint(50, 200),
            associated_task_template=f'Check {param.lower()} sensor and recalibrate',
            is_active=random.choice([True, True, True, False])
        )
        triggers_count += 1

print(f"Created {triggers_count} maintenance triggers")

# Create telemetry logs
print("Creating telemetry logs...")
telemetry_count = 0
for eq in random.sample(equipment_list, 30):
    for _ in range(random.randint(10, 50)):
        param = random.choice(['Temperature', 'Vibration', 'Running_Hours', 'Pressure'])
        value = random.uniform(20, 150)
        is_anomaly = value > 120 or value < 30
        
        MachineTelemetryLog.objects.create(
            equipment=eq,
            parameter_type=param,
            value=value,
            reading_date_time=fake.date_time_between(start_date='-7d', end_date='now'),
            is_anomaly=is_anomaly,
            processed_flag=random.choice([True, False])
        )
        telemetry_count += 1

print(f"Created {telemetry_count} telemetry logs")

# Create tickets
print("Creating tickets...")
tickets_list = []
for i in range(100):
    equipment = random.choice(equipment_list)
    ticket = Ticket.objects.create(
        title=f'{random.choice(["Repair", "Inspection", "Maintenance", "Emergency Fix"])} - {equipment.name}',
        description=fake.text(max_nb_chars=300),
        equipment=equipment,
        request_type=random.choice(['Corrective', 'Preventive', 'Condition_Based']),
        stage=random.choice(['New', 'In Progress', 'In Progress', 'Repaired', 'Scrap']),
        priority=random.choice(['Low', 'Medium', 'Medium', 'High', 'Critical']),
        assigned_team=equipment.assigned_team or random.choice(teams),
        assigned_technician=equipment.assigned_technician or random.choice(technicians),
        created_by=random.choice(managers + [admin]),
        scheduled_date=fake.date_time_between(start_date='-10d', end_date='+10d'),
        completion_date=fake.date_time_between(start_date='-5d', end_date='now') if random.random() > 0.5 else None,
        duration_hours=random.uniform(0.5, 8.0),
        created_at=fake.date_time_between(start_date='-30d', end_date='now')
    )
    tickets_list.append(ticket)

print(f"Created {len(tickets_list)} tickets")

# Create messages for tickets
print("Creating messages...")
messages_count = 0
for ticket in random.sample(tickets_list, 60):
    num_messages = random.randint(1, 10)
    for i in range(num_messages):
        user = random.choice([ticket.created_by, ticket.assigned_technician] + managers + technicians)
        Message.objects.create(
            ticket=ticket,
            user=user if user else random.choice(technicians),
            content=fake.sentence(nb_words=random.randint(5, 20)),
            type=random.choice(['text', 'text', 'text', 'voice', 'system']),
            created_at=ticket.created_at + timedelta(hours=i*2)
        )
        messages_count += 1

print(f"Created {messages_count} messages")

print("\n" + "="*50)
print("SEED DATA CREATION COMPLETE!")
print("="*50)
print(f"Total Users: {User.objects.count()}")
print(f"Total Teams: {MaintenanceTeam.objects.count()}")
print(f"Total Hierarchy Nodes: {AssetHierarchy.objects.count()}")
print(f"Total Equipment: {Equipment.objects.count()}")
print(f"Total Triggers: {MaintenanceTrigger.objects.count()}")
print(f"Total Telemetry Logs: {MachineTelemetryLog.objects.count()}")
print(f"Total Tickets: {Ticket.objects.count()}")
print(f"Total Messages: {Message.objects.count()}")
print("="*50)
print("\nDefault login credentials:")
print("Username: admin")
print("Password: admin123")
print("\nOr use: manager1, tech1, etc. (password: password123)")
