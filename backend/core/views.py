from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Q, Count
from .models import (
    User, MaintenanceTeam, AssetHierarchy, Equipment,
    MaintenanceTrigger, MachineTelemetryLog, Ticket, Message
)
from .serializers import (
    UserSerializer, UserCreateSerializer, MaintenanceTeamSerializer,
    AssetHierarchySerializer, EquipmentSerializer, MaintenanceTriggerSerializer,
    MachineTelemetryLogSerializer, TicketSerializer, TicketDetailSerializer,
    MessageSerializer
)


# Authentication Views
@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    """User registration endpoint"""
    serializer = UserCreateSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """User login endpoint"""
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    
    # Allow login with email or username
    if email and not username:
        try:
            user_obj = User.objects.get(email=email)
            username = user_obj.username
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
    
    user = authenticate(username=username, password=password)
    
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    return Response(
        {'error': 'Invalid credentials'},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Get current authenticated user"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


# ViewSets
class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User model"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name', 'job_title']
    ordering_fields = ['username', 'date_joined']
    ordering = ['-date_joined']


class MaintenanceTeamViewSet(viewsets.ModelViewSet):
    """ViewSet for MaintenanceTeam model"""
    queryset = MaintenanceTeam.objects.all()
    serializer_class = MaintenanceTeamSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


class AssetHierarchyViewSet(viewsets.ModelViewSet):
    """ViewSet for AssetHierarchy model"""
    queryset = AssetHierarchy.objects.all()
    serializer_class = AssetHierarchySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'level_type']
    
    def get_queryset(self):
        """Filter by level_type if provided"""
        queryset = super().get_queryset()
        level_type = self.request.query_params.get('level_type', None)
        if level_type:
            queryset = queryset.filter(level_type=level_type)
        return queryset
    
    @action(detail=False, methods=['get'])
    def tree(self, request):
        """Get complete hierarchy tree"""
        roots = self.queryset.filter(parent__isnull=True)
        serializer = self.get_serializer(roots, many=True)
        return Response(serializer.data)


class EquipmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Equipment model"""
    queryset = Equipment.objects.select_related(
        'asset_hierarchy', 'assigned_team', 'assigned_technician'
    ).all()
    serializer_class = EquipmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'serial_number', 'model', 'manufacturer', 'department']
    ordering_fields = ['name', 'created_at', 'health_score']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter equipment by status, team, etc."""
        queryset = super().get_queryset()
        
        status_filter = self.request.query_params.get('status', None)
        team_id = self.request.query_params.get('team', None)
        hierarchy_id = self.request.query_params.get('hierarchy', None)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if team_id:
            queryset = queryset.filter(assigned_team_id=team_id)
        if hierarchy_id:
            queryset = queryset.filter(asset_hierarchy_id=hierarchy_id)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def telemetry(self, request, pk=None):
        """Get telemetry logs for specific equipment"""
        equipment = self.get_object()
        logs = equipment.telemetry_logs.all()[:100]  # Last 100 readings
        serializer = MachineTelemetryLogSerializer(logs, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def tickets(self, request, pk=None):
        """Get tickets for specific equipment"""
        equipment = self.get_object()
        tickets = equipment.tickets.all()
        serializer = TicketSerializer(tickets, many=True)
        return Response(serializer.data)


class MaintenanceTriggerViewSet(viewsets.ModelViewSet):
    """ViewSet for MaintenanceTrigger model"""
    queryset = MaintenanceTrigger.objects.select_related('equipment').all()
    serializer_class = MaintenanceTriggerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter triggers by equipment"""
        queryset = super().get_queryset()
        equipment_id = self.request.query_params.get('equipment', None)
        if equipment_id:
            queryset = queryset.filter(equipment_id=equipment_id)
        return queryset


class MachineTelemetryLogViewSet(viewsets.ModelViewSet):
    """ViewSet for MachineTelemetryLog model"""
    queryset = MachineTelemetryLog.objects.select_related('equipment').all()
    serializer_class = MachineTelemetryLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering = ['-reading_date_time']
    
    def get_queryset(self):
        """Filter telemetry by equipment and parameter type"""
        queryset = super().get_queryset()
        
        equipment_id = self.request.query_params.get('equipment', None)
        parameter = self.request.query_params.get('parameter', None)
        anomaly_only = self.request.query_params.get('anomaly', None)
        
        if equipment_id:
            queryset = queryset.filter(equipment_id=equipment_id)
        if parameter:
            queryset = queryset.filter(parameter_type=parameter)
        if anomaly_only == 'true':
            queryset = queryset.filter(is_anomaly=True)
        
        return queryset[:1000]  # Limit to 1000 most recent


class TicketViewSet(viewsets.ModelViewSet):
    """ViewSet for Ticket model"""
    queryset = Ticket.objects.select_related(
        'equipment', 'assigned_team', 'assigned_technician', 'created_by'
    ).prefetch_related('messages').annotate(
        message_count=Count('messages')
    ).all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'equipment__name']
    ordering_fields = ['created_at', 'updated_at', 'priority']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Use detailed serializer for retrieve action"""
        if self.action == 'retrieve':
            return TicketDetailSerializer
        return TicketSerializer
    
    def get_queryset(self):
        """Filter tickets by various criteria"""
        queryset = super().get_queryset()
        
        stage = self.request.query_params.get('stage', None)
        priority = self.request.query_params.get('priority', None)
        request_type = self.request.query_params.get('request_type', None)
        equipment_id = self.request.query_params.get('equipment', None)
        assigned_to = self.request.query_params.get('assigned_to', None)
        team_id = self.request.query_params.get('team', None)
        
        if stage:
            queryset = queryset.filter(stage=stage)
        if priority:
            queryset = queryset.filter(priority=priority)
        if request_type:
            queryset = queryset.filter(request_type=request_type)
        if equipment_id:
            queryset = queryset.filter(equipment_id=equipment_id)
        if assigned_to:
            queryset = queryset.filter(assigned_technician_id=assigned_to)
        if team_id:
            queryset = queryset.filter(assigned_team_id=team_id)
        
        return queryset
    
    def perform_create(self, serializer):
        """Set created_by to current user"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_message(self, request, pk=None):
        """Add a message to a ticket"""
        ticket = self.get_object()
        serializer = MessageSerializer(data={
            **request.data,
            'ticket': ticket.id,
            'user': request.user.id
        })
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MessageViewSet(viewsets.ModelViewSet):
    """ViewSet for Message model"""
    queryset = Message.objects.select_related('user', 'ticket').all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter messages by ticket"""
        queryset = super().get_queryset()
        ticket_id = self.request.query_params.get('ticket', None)
        if ticket_id:
            queryset = queryset.filter(ticket_id=ticket_id)
        return queryset
    
    def perform_create(self, serializer):
        """Set user to current user"""
        serializer.save(user=self.request.user)
