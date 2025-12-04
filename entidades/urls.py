# entidades/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import api_views
from entidades.api_views import MuscleViewSet

app_name = "entrenador"   

router = DefaultRouter()
router.register(r'ejercicios', api_views.ExerciseViewSet)
router.register(r'usuarios', api_views.UserViewSet)
router.register(r'entrenadores', api_views.CoachViewSet)
router.register(r'clientes', api_views.ClientViewSet)
router.register(r'asignaturas', api_views.AsignatureViewSet)
router.register(r'recordatorios', api_views.ReminderViewSet)
router.register(r'sesiones-entrenamiento', api_views.TrainingSessionViewSet)
router.register(r'rutinas', api_views.RutineViewSet)
router.register(r'dias-rutina', api_views.DayRutineViewSet)
router.register(r'ejercicios-rutina', api_views.ExerciseRutineViewSet)
router.register(r'registros-progreso', api_views.ProgressRegisterViewSet)
router.register(r'equipos', api_views.EquipmentViewSet)
router.register(r'muscles', MuscleViewSet, basename='muscles')

urlpatterns = [
    # IMPORTANTE: Primero las rutas de API
    path('api/', include((router.urls, 'api'))),  # Esto debe ir PRIMERO
    
    # Luego las vistas HTML
    path('', views.home_view, name='home'),    
    path('clientes/', views.clients_page, name='clientes'),
    path('clientes/nuevo/', views.new_client, name='nuevo_cliente'),

    path('ejercicios/', views.exercise_page, name='ejercicios'),
    path('ejercicios/nuevo/', views.new_exercise, name='nuevo_ejercicio'),

    path('entrenadores/', views.trainers_page, name='entrenadores'),
    path('entrenadores/nuevo/', views.new_trainer, name='nuevo_entrenador'),

    path('rutinas/', views.routine_page, name='rutinas'),
    path('rutinas/nuevo/', views.new_routine, name='nueva_rutina'),

    path('equipos/', views.equipment_page, name='equipos'),
    path('equipos/nuevo/', views.new_equipment, name='nuevo_equipo'),

    # Nueva ruta para la página de músculos
    path('musculos/', views.muscles_page, name='musculos'),

    # Endpoint(s) API adicionales
    path('api/clientes/active/', api_views.active_clients, name='active_clients'),
]