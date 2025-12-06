# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import api_views


app_name = "entrenador"  


router = DefaultRouter()
router.register(r'ejercicios', api_views.ExerciseViewSet)
router.register(r'muscle-groups', api_views.MuscleGroupViewSet)
router.register(r'muscle-subgroups', api_views.MuscleSubgroupViewSet)
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
router.register(r'muscles', api_views.MuscleViewSet, basename='muscles')


urlpatterns = [
    # API
    path('api/', include((router.urls, 'api'))),
   
    # Vistas HTML
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

    path('musculos/', views.muscles_page, name='musculos'),

    # Autenticación
    path('signup/', views.sign_up, name='signup'),
    path('logout/', views.signout, name='signout'),
    path('signin/', views.signin, name='signin'),

    # Endpoints API adicionales
    path('api/clientes/active/', api_views.active_clients, name='active_clients'),
]