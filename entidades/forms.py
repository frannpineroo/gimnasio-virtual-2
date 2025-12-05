from django import forms
from django.forms import ModelForm
from .models import MuscleGroup, MuscleSubgroup, Exercise, User, Coach, Client, Asignature, Reminder, TrainingSession, Rutine, DayRutine, ExerciseRutine, ProgressRegister, Equipment

class ExerciseForm(ModelForm):
    class Meta:
        model = Exercise
        fields = ['name', 'description', 'muscle_group', 'muscle_subgroup']
        labels = {
            'name': 'Nombre del ejercicio',
            'description': 'Descripción del ejercicio',
            'muscle_group': 'Grupo muscular',
            'muscle_subgroup': 'Subgrupo muscular',
        }

class RutineForm(ModelForm):
    exercises = forms.ModelMultipleChoiceField(
        queryset=Exercise.objects.all(),
        widget=forms.CheckboxSelectMultiple,
        required=False,
        label="Ejercicios"
    )
    class Meta:
        model = Rutine
        fields = ['name', 'description', 'time_week', 'days_per_week', 'goal', 'coach', 'client', 'is_template']
        labels = {
            'name': 'Nombre de la rutina',
            'description': 'Descripción de la rutina',
            'time_week': 'Duración semanal',
            'days_per_week': 'Días por semana',
            'goal': 'Objetivo',
            'coach': 'Entrenador',
            'client': 'Cliente',
            'is_template': '¿Es una plantilla?',
        }