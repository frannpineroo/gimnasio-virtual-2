from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import ExerciseSerializer, UserSerializer, CoachSerializer, ClientSerializer, AsignatureSerializer, ReminderSerializer, TrainingSessionSerializer, RutineSerializer, DayRutineSerializer, ExerciseRutineSerializer, ProgressRegisterSerializer, EquipmentSerializer, MuscleSerializer 
from .models import Exercise, User, Coach, Client, Asignature, Reminder, TrainingSession, Rutine, DayRutine, ExerciseRutine, ProgressRegister, Equipment, Muscle 

class ExerciseViewSet(viewsets.ModelViewSet):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class CoachViewSet(viewsets.ModelViewSet):
    queryset = Coach.objects.all()
    serializer_class = CoachSerializer

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

class AsignatureViewSet(viewsets.ModelViewSet):
    queryset = Asignature.objects.all()
    serializer_class = AsignatureSerializer

class ReminderViewSet(viewsets.ModelViewSet):
    queryset = Reminder.objects.all()
    serializer_class = ReminderSerializer

class TrainingSessionViewSet(viewsets.ModelViewSet):
    queryset = TrainingSession.objects.all()
    serializer_class = TrainingSessionSerializer

class RutineViewSet(viewsets.ModelViewSet):
    queryset = Rutine.objects.all()
    serializer_class = RutineSerializer

class DayRutineViewSet(viewsets.ModelViewSet):
    queryset = DayRutine.objects.all()
    serializer_class = DayRutineSerializer

class ExerciseRutineViewSet(viewsets.ModelViewSet):
    queryset = ExerciseRutine.objects.all()
    serializer_class = ExerciseRutineSerializer

class ProgressRegisterViewSet(viewsets.ModelViewSet):
    queryset = ProgressRegister.objects.all()
    serializer_class = ProgressRegisterSerializer

class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer

# ViewSet para músculos - AL FINAL
class MuscleViewSet(viewsets.ModelViewSet):
    queryset = Muscle.objects.all()
    serializer_class = MuscleSerializer

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