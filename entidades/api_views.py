from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User as AuthUser
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
    ExerciseRutine, ProgressRegister, Equipment, Muscle, UserProfile
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

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        client = serializer.save()

        # Crear el auth_user solo si tiene el email
        if client.email:
            base_username = client.email.split('@')[0]
            username = base_username
            counter = 1
            # Evitar duplicados
            while AuthUser.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            temp_password = client.dni if client.dni else "contra1234"

            auth_user = AuthUser.objects.create_user(
                username=username,
                email=client.email,
                password=temp_password,
                first_name=client.name,
                last_name=client.last_name
            )

            UserProfile.objects.create(user=auth_user, role=UserProfile.CLIENT)

            custom_user = User.objects.filter(username=username).first()
            if custom_user:
                client.user = custom_user
                client.save()
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

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

    def get_queryset(self):
        queryset = DayRutine.objects.all()
        rutine = self.request.query_params.get('rutine')
        if rutine:
            queryset = queryset.filter(rutine_id=rutine)
        return queryset


class ExerciseRutineViewSet(viewsets.ModelViewSet):
    queryset = ExerciseRutine.objects.all()
    serializer_class = ExerciseRutineSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ExerciseRutine.objects.all()
        dia_rutine = self.request.query_params.get('dia_rutine')
        if dia_rutine:
            queryset = queryset.filter(dia_rutine_id=dia_rutine)
        return queryset


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
