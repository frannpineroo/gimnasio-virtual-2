from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .serializers import (
    ExerciseSerializer, MuscleGroupSerializer, MuscleSubgroupSerializer,
    UserSerializer, CoachSerializer, ClientSerializer, AsignatureSerializer,
    ReminderSerializer, TrainingSessionSerializer, RutineSerializer,
    DayRutineSerializer, ExerciseRutineSerializer, ProgressRegisterSerializer,
    EquipmentSerializer, MuscleSerializer
)
from .models import (
    Exercise, MuscleGroup, MuscleSubgroup, User, Coach, Client,
    Asignature, Reminder, TrainingSession, Rutine, DayRutine,
    ExerciseRutine, ProgressRegister, Equipment, Muscle
)


class MuscleGroupViewSet(viewsets.ModelViewSet):
    queryset = MuscleGroup.objects.all()
    serializer_class = MuscleGroupSerializer
    permission_classes = [IsAuthenticated]


class MuscleSubgroupViewSet(viewsets.ModelViewSet):
    queryset = MuscleSubgroup.objects.all()
    serializer_class = MuscleSubgroupSerializer
    permission_classes = [IsAuthenticated]
   
    def get_queryset(self):
        queryset = MuscleSubgroup.objects.all()
        muscle_group_id = self.request.query_params.get('muscle_group', None)
        if muscle_group_id:
            queryset = queryset.filter(muscle_group_id=muscle_group_id)
        return queryset


class ExerciseViewSet(viewsets.ModelViewSet):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    permission_classes = [IsAuthenticated]
   
    def get_queryset(self):
        queryset = Exercise.objects.all()
       
        # Filtros
        muscle_group = self.request.query_params.get('muscle_group', None)
        search = self.request.query_params.get('search', None)
        active_only = self.request.query_params.get('active_only', 'true')
       
        if muscle_group:
            queryset = queryset.filter(muscle_group_id=muscle_group)
       
        if search:
            queryset = queryset.filter(name__icontains=search)
       
        if active_only.lower() == 'true':
            queryset = queryset.filter(is_active=True)
           
        return queryset
   
    @action(detail=False, methods=['get'])
    def muscle_groups(self, request):
        """Obtener lista de grupos musculares únicos con ejercicios"""
        muscle_groups = MuscleGroup.objects.filter(exercises__isnull=False).distinct()
        serializer = MuscleGroupSerializer(muscle_groups, many=True)
        return Response(serializer.data)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class CoachViewSet(viewsets.ModelViewSet):
    queryset = Coach.objects.all()
    serializer_class = CoachSerializer
    permission_classes = [IsAuthenticated]


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]


class AsignatureViewSet(viewsets.ModelViewSet):
    queryset = Asignature.objects.all()
    serializer_class = AsignatureSerializer
    permission_classes = [IsAuthenticated]


class ReminderViewSet(viewsets.ModelViewSet):
    queryset = Reminder.objects.all()
    serializer_class = ReminderSerializer
    permission_classes = [IsAuthenticated]


class TrainingSessionViewSet(viewsets.ModelViewSet):
    queryset = TrainingSession.objects.all()
    serializer_class = TrainingSessionSerializer
    permission_classes = [IsAuthenticated]


class RutineViewSet(viewsets.ModelViewSet):
    queryset = Rutine.objects.all()
    serializer_class = RutineSerializer
    permission_classes = [IsAuthenticated]


class DayRutineViewSet(viewsets.ModelViewSet):
    queryset = DayRutine.objects.all()
    serializer_class = DayRutineSerializer
    permission_classes = [IsAuthenticated]


class ExerciseRutineViewSet(viewsets.ModelViewSet):
    queryset = ExerciseRutine.objects.all()
    serializer_class = ExerciseRutineSerializer
    permission_classes = [IsAuthenticated]


class ProgressRegisterViewSet(viewsets.ModelViewSet):
    queryset = ProgressRegister.objects.all()
    serializer_class = ProgressRegisterSerializer
    permission_classes = [IsAuthenticated]


class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer
    permission_classes = [IsAuthenticated]


class MuscleViewSet(viewsets.ModelViewSet):
    queryset = Muscle.objects.all()
    serializer_class = MuscleSerializer
    permission_classes = [IsAuthenticated]


    def get_queryset(self):
        queryset = Muscle.objects.all()
       
        # Filtro por tipo
        muscle_type = self.request.query_params.get('type', None)
        if muscle_type:
            queryset = queryset.filter(muscle_type=muscle_type)
           
        # Filtro solo grupos (para el select de subgrupos)
        only_groups = self.request.query_params.get('only_groups', None)
        if only_groups:
            queryset = queryset.filter(muscle_type='group')
           
        return queryset


@api_view(['GET'])
def active_clients(request):
    """Retornar todos los clientes con status='active'"""
    clients = Client.objects.filter(status='active')
    serializer = ClientSerializer(clients, many=True)
    return Response(serializer.data)
