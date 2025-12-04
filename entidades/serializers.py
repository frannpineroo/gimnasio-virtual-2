# entidades/serializers.py 

from rest_framework import serializers
from .models import Exercise, User, Coach, Client, Asignature, Reminder, TrainingSession, Rutine, DayRutine, ExerciseRutine, ProgressRegister, Equipment, Muscle  

class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class CoachSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coach
        fields = '__all__'

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'

class AsignatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asignature
        fields = '__all__'

class ReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reminder
        fields = '__all__'

class TrainingSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingSession
        fields = '__all__'

class RutineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rutine
        fields = '__all__'

class DayRutineSerializer(serializers.ModelSerializer):
    class Meta:
        model = DayRutine
        fields = '__all__'

class ExerciseRutineSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseRutine
        fields = '__all__'

class ProgressRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgressRegister
        fields = '__all__'

class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = '__all__'

# MuscleSerializer
class MuscleSerializer(serializers.ModelSerializer):
    parent_name = serializers.SerializerMethodField()
    exercises_count = serializers.SerializerMethodField()
    type_display = serializers.CharField(source='get_muscle_type_display', read_only=True)

    class Meta:
        model = Muscle  
        fields = [
            'id', 'name', 'muscle_type', 'type_display', 'parent', 
            'parent_name', 'description', 'exercises_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_parent_name(self, obj):
        return obj.parent.name if obj.parent else None

    def get_exercises_count(self, obj):
        return obj.get_exercises_count()