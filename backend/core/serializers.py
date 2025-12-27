from rest_framework import serializers
from .models import (
    User, MaintenanceTeam, AssetHierarchy, Equipment,
    MaintenanceTrigger, MachineTelemetryLog, Ticket, Message
)
from django.contrib.auth.password_validation import validate_password


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'avatar', 'job_title', 'is_active', 'date_joined'
        ]
        read_only_fields = ['id', 'date_joined']


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new users (signup)"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password2',
            'first_name', 'last_name', 'role', 'job_title'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class MaintenanceTeamSerializer(serializers.ModelSerializer):
    """Serializer for MaintenanceTeam model"""
    lead_manager_name = serializers.CharField(source='lead_manager.get_full_name', read_only=True)
    
    class Meta:
        model = MaintenanceTeam
        fields = ['id', 'name', 'lead_manager', 'lead_manager_name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class AssetHierarchySerializer(serializers.ModelSerializer):
    """Serializer for AssetHierarchy model"""
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = AssetHierarchy
        fields = ['id', 'name', 'level_type', 'parent', 'children', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_children(self, obj):
        if hasattr(obj, 'children'):
            return AssetHierarchySerializer(obj.children.all(), many=True).data
        return []


class EquipmentSerializer(serializers.ModelSerializer):
    """Serializer for Equipment model"""
    assigned_team_name = serializers.CharField(source='assigned_team.name', read_only=True)
    assigned_technician_name = serializers.CharField(source='assigned_technician.get_full_name', read_only=True)
    hierarchy_name = serializers.CharField(source='asset_hierarchy.name', read_only=True)
    
    class Meta:
        model = Equipment
        fields = [
            'id', 'name', 'serial_number', 'model', 'manufacturer',
            'asset_hierarchy', 'hierarchy_name', 'location_description', 'department',
            'status', 'health_score',
            'assigned_team', 'assigned_team_name',
            'assigned_technician', 'assigned_technician_name',
            'purchase_date', 'warranty_expiry_date', 'last_maintenance', 'next_maintenance',
            'image', 'description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MaintenanceTriggerSerializer(serializers.ModelSerializer):
    """Serializer for MaintenanceTrigger model"""
    equipment_name = serializers.CharField(source='equipment.name', read_only=True)
    
    class Meta:
        model = MaintenanceTrigger
        fields = [
            'id', 'equipment', 'equipment_name', 'trigger_name',
            'parameter_type', 'operation_type', 'threshold_value',
            'associated_task_template', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MachineTelemetryLogSerializer(serializers.ModelSerializer):
    """Serializer for MachineTelemetryLog model"""
    equipment_name = serializers.CharField(source='equipment.name', read_only=True)
    
    class Meta:
        model = MachineTelemetryLog
        fields = [
            'id', 'equipment', 'equipment_name', 'parameter_type', 'value',
            'reading_date_time', 'processed_flag', 'is_anomaly', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for Message model"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_avatar = serializers.CharField(source='user.avatar', read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 'ticket', 'user', 'user_name', 'user_avatar',
            'content', 'type', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class TicketSerializer(serializers.ModelSerializer):
    """Serializer for Ticket model"""
    equipment_name = serializers.CharField(source='equipment.name', read_only=True)
    assigned_team_name = serializers.CharField(source='assigned_team.name', read_only=True)
    assigned_technician_name = serializers.CharField(source='assigned_technician.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    messages_count = serializers.IntegerField(source='messages.count', read_only=True)
    
    class Meta:
        model = Ticket
        fields = [
            'id', 'title', 'description', 'equipment', 'equipment_name',
            'request_type', 'stage', 'priority',
            'assigned_team', 'assigned_team_name',
            'assigned_technician', 'assigned_technician_name',
            'created_by', 'created_by_name',
            'scheduled_date', 'completion_date', 'duration_hours',
            'messages_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TicketDetailSerializer(TicketSerializer):
    """Detailed serializer for Ticket with messages"""
    messages = MessageSerializer(many=True, read_only=True)
    
    class Meta(TicketSerializer.Meta):
        fields = TicketSerializer.Meta.fields + ['messages']
