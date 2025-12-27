from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    signup, login, current_user,
    UserViewSet, MaintenanceTeamViewSet, AssetHierarchyViewSet,
    EquipmentViewSet, MaintenanceTriggerViewSet, MachineTelemetryLogViewSet,
    TicketViewSet, MessageViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'teams', MaintenanceTeamViewSet, basename='team')
router.register(r'hierarchy', AssetHierarchyViewSet, basename='hierarchy')
router.register(r'equipment', EquipmentViewSet, basename='equipment')
router.register(r'triggers', MaintenanceTriggerViewSet, basename='trigger')
router.register(r'telemetry', MachineTelemetryLogViewSet, basename='telemetry')
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    # Authentication endpoints
    path('auth/signup/', signup, name='signup'),
    path('auth/login/', login, name='login'),
    path('auth/me/', current_user, name='current-user'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API routes
    path('', include(router.urls)),
]
