from django.forms import ModelForm
from .models import MuscleGroup, MuscleSubgroup, Exercise, User, Coach, Client, Asignature, Reminder, TrainingSession, Rutine, DayRutine, ExerciseRutine, ProgressRegister, Equipment

class ExerciseForm(ModelForm):
    class Meta:
        model = Exercise
        fields = ['name', 'description', 'muscle_group', 'muscle_subgroup']

class RutineForm(ModelForm):
    class Meta:
        model = Rutine
        fields = ['name', 'description', 'time_week', 'days_per_week', 'goal', 'coach', 'client', 'is_template']