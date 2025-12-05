from rest_framework import serializers
from .models import Exercise, MuscleGroup, MuscleSubgroup, User, Coach, Client, Asignature, Reminder, TrainingSession, Rutine, DayRutine, ExerciseRutine, ProgressRegister, Equipment, Muscle


class MuscleGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = MuscleGroup
        fields = ['id', 'name', 'description', 'created_at']


class MuscleSubgroupSerializer(serializers.ModelSerializer):
    muscle_group_name = serializers.CharField(source='muscle_group.name', read_only=True)
   
    class Meta:
        model = MuscleSubgroup
        fields = ['id', 'name', 'description', 'muscle_group', 'muscle_group_name', 'created_at']


class ExerciseSerializer(serializers.ModelSerializer):
    muscle_group_name = serializers.CharField(source='muscle_group.name', read_only=True)
    muscle_subgroup_name = serializers.CharField(source='muscle_subgroup.name', read_only=True)
    difficulty_display = serializers.CharField(source='get_difficulty_display', read_only=True)
   
    class Meta:
        model = Exercise
        fields = [
            'id', 'name', 'description', 'instructions', 'difficulty',
            'difficulty_display', 'equipment_required', 'image_url', 'video_url',
            'muscle_group', 'muscle_group_name', 'muscle_subgroup', 'muscle_subgroup_name',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


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
