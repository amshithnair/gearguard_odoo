from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import uuid


class User(AbstractUser):
    """
    Custom User model matching the frontend's User interface
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('technician', 'Technician'),
        ('viewer', 'Viewer'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='viewer')
    avatar = models.CharField(max_length=500, blank=True, null=True)
    job_title = models.CharField(max_length=100, blank=True, null=True)
    
    class Meta:
        db_table = 'users'
    
    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"


class MaintenanceTeam(models.Model):
    """
    Maintenance teams (e.g., HVAC, IT, Mechanical)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    lead_manager = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='led_teams'
    )
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'maintenance_teams'
    
    def __str__(self):
        return self.name


class AssetHierarchy(models.Model):
    """
    ISA-95 Asset Hierarchy (Site -> Area -> Work Center)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    LEVEL_CHOICES = [
        ('Site', 'Site'),
        ('Area', 'Area'),
        ('Work Center', 'Work Center'),
    ]
    level_type = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'asset_hierarchy'
        verbose_name_plural = 'Asset Hierarchies'
    
    def __str__(self):
        return f"{self.level_type}: {self.name}"


class Equipment(models.Model):
    """
    Equipment/Asset model matching frontend's Equipment interface
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    serial_number = models.CharField(max_length=100, unique=True)
    model = models.CharField(max_length=100, blank=True, null=True)
    manufacturer = models.CharField(max_length=100, blank=True, null=True)
    
    # Location and hierarchy
    asset_hierarchy = models.ForeignKey(
        AssetHierarchy,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='equipment'
    )
    location_description = models.CharField(max_length=200, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    
    # Status and health
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Under Maintenance', 'Under Maintenance'),
        ('Scrapped', 'Scrapped'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    health_score = models.IntegerField(default=100, help_text='0-100 health score')
    
    # Assignment
    assigned_team = models.ForeignKey(
        MaintenanceTeam,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='equipment'
    )
    assigned_technician = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_equipment'
    )
    
    # Dates
    purchase_date = models.DateTimeField(null=True, blank=True)
    warranty_expiry_date = models.DateTimeField(null=True, blank=True)
    last_maintenance = models.DateTimeField(null=True, blank=True)
    next_maintenance = models.DateTimeField(null=True, blank=True)
    
    # Image
    image = models.CharField(max_length=500, blank=True, null=True)
    
    # Metadata
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'equipment'
    
    def __str__(self):
        return f"{self.name} ({self.serial_number})"


class MaintenanceTrigger(models.Model):
    """
    Automation rules for triggering maintenance based on telemetry
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    equipment = models.ForeignKey(
        Equipment,
        on_delete=models.CASCADE,
        related_name='triggers'
    )
    trigger_name = models.CharField(max_length=200)
    
    PARAMETER_CHOICES = [
        ('Running_Hours', 'Running Hours'),
        ('Temperature', 'Temperature'),
        ('Vibration', 'Vibration'),
        ('Cycle_Count', 'Cycle Count'),
    ]
    parameter_type = models.CharField(max_length=50, choices=PARAMETER_CHOICES)
    
    OPERATION_CHOICES = [
        ('Greater_Than', 'Greater Than'),
        ('Less_Than', 'Less Than'),
        ('Equals', 'Equals'),
    ]
    operation_type = models.CharField(max_length=20, choices=OPERATION_CHOICES)
    threshold_value = models.DecimalField(max_digits=10, decimal_places=2)
    
    associated_task_template = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'maintenance_triggers'
    
    def __str__(self):
        return f"{self.trigger_name} - {self.equipment.name}"


class MachineTelemetryLog(models.Model):
    """
    Telemetry data logs from equipment sensors
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    equipment = models.ForeignKey(
        Equipment,
        on_delete=models.CASCADE,
        related_name='telemetry_logs'
    )
    parameter_type = models.CharField(max_length=100)
    value = models.DecimalField(max_digits=12, decimal_places=4)
    reading_date_time = models.DateTimeField(default=timezone.now)
    processed_flag = models.BooleanField(default=False)
    is_anomaly = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'machine_telemetry_log'
        ordering = ['-reading_date_time']
    
    def __str__(self):
        return f"{self.equipment.name} - {self.parameter_type}: {self.value}"


class Ticket(models.Model):
    """
    Maintenance ticket/request model
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    
    equipment = models.ForeignKey(
        Equipment,
        on_delete=models.CASCADE,
        related_name='tickets'
    )
    
    REQUEST_TYPE_CHOICES = [
        ('Corrective', 'Corrective'),
        ('Preventive', 'Preventive'),
        ('Condition_Based', 'Condition Based'),
    ]
    request_type = models.CharField(max_length=20, choices=REQUEST_TYPE_CHOICES, default='Corrective')
    
    STAGE_CHOICES = [
        ('New', 'New'),
        ('In Progress', 'In Progress'),
        ('Repaired', 'Repaired'),
        ('Scrap', 'Scrap'),
    ]
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='New')
    
    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    ]
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    
    # Assignment
    assigned_team = models.ForeignKey(
        MaintenanceTeam,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tickets'
    )
    assigned_technician = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tickets'
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_tickets'
    )
    
    # Dates and duration
    scheduled_date = models.DateTimeField(null=True, blank=True)
    completion_date = models.DateTimeField(null=True, blank=True)
    duration_hours = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=0,
        help_text='Hours spent on this ticket'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tickets'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"[{self.stage}] {self.title}"


class Message(models.Model):
    """
    Messages/comments on tickets (conversation thread)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='messages'
    )
    content = models.TextField()
    
    MESSAGE_TYPE_CHOICES = [
        ('text', 'Text'),
        ('voice', 'Voice'),
        ('system', 'System'),
    ]
    type = models.CharField(max_length=20, choices=MESSAGE_TYPE_CHOICES, default='text')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'messages'
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.user.username if self.user else 'System'}: {self.content[:50]}"
