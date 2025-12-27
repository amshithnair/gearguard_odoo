from django.contrib import admin
from .models import (
    User, MaintenanceTeam, AssetHierarchy, Equipment,
    MaintenanceTrigger, MachineTelemetryLog, Ticket, Message
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'role', 'job_title', 'is_active', 'date_joined']
    list_filter = ['role', 'is_active', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name']


@admin.register(MaintenanceTeam)
class MaintenanceTeamAdmin(admin.ModelAdmin):
    list_display = ['name', 'lead_manager', 'created_at']
    search_fields = ['name', 'description']


@admin.register(AssetHierarchy)
class AssetHierarchyAdmin(admin.ModelAdmin):
    list_display = ['name', 'level_type', 'parent', 'created_at']
    list_filter = ['level_type']
    search_fields = ['name']


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'serial_number', 'status', 'health_score', 'assigned_team', 'created_at']
    list_filter = ['status', 'assigned_team', 'manufacturer']
    search_fields = ['name', 'serial_number', 'model']


@admin.register(MaintenanceTrigger)
class MaintenanceTriggerAdmin(admin.ModelAdmin):
    list_display = ['trigger_name', 'equipment', 'parameter_type', 'operation_type', 'threshold_value', 'is_active']
    list_filter = ['parameter_type', 'operation_type', 'is_active']
    search_fields = ['trigger_name', 'equipment__name']


@admin.register(MachineTelemetryLog)
class MachineTelemetryLogAdmin(admin.ModelAdmin):
    list_display = ['equipment', 'parameter_type', 'value', 'reading_date_time', 'is_anomaly']
    list_filter = ['parameter_type', 'is_anomaly', 'processed_flag']
    search_fields = ['equipment__name', 'parameter_type']
    date_hierarchy = 'reading_date_time'


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ['title', 'equipment', 'stage', 'priority', 'request_type', 'assigned_technician', 'created_at']
    list_filter = ['stage', 'priority', 'request_type', 'assigned_team']
    search_fields = ['title', 'description', 'equipment__name']
    date_hierarchy = 'created_at'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['ticket', 'user', 'type', 'content_preview', 'created_at']
    list_filter = ['type', 'created_at']
    search_fields = ['content', 'ticket__title', 'user__username']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'
