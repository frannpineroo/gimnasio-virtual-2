from django import forms
from django.forms import ModelForm
from .models import Exercise, MuscleGroup, MuscleSubgroup, Rutine


class ExerciseForm(ModelForm):
    class Meta:
        model = Exercise
        fields = ['name', 'description', 'muscle_group', 'muscle_subgroup']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nombre del ejercicio'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Descripción del ejercicio'
            }),
            'muscle_group': forms.Select(attrs={
                'class': 'form-select',
                'id': 'muscle_group'
            }),
            'muscle_subgroup': forms.Select(attrs={
                'class': 'form-select',
                'id': 'muscle_subgroup'
            }),
        }
        labels = {
            'name': 'Nombre del Ejercicio',
            'description': 'Descripción',
            'muscle_group': 'Grupo Muscular',
            'muscle_subgroup': 'Subgrupo Muscular',
        }


    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Ordenar grupos musculares por nombre
        self.fields['muscle_group'].queryset = MuscleGroup.objects.all().order_by('name')
        self.fields['muscle_subgroup'].queryset = MuscleSubgroup.objects.all().order_by('name')
       
        # Establecer atributos de opciones vacías
        self.fields['muscle_group'].empty_label = 'Selecciona un grupo muscular'
        self.fields['muscle_subgroup'].empty_label = 'Selecciona un subgrupo muscular'


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
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nombre de la rutina'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Descripción de la rutina'
            }),
            'time_week': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Tiempo por semana (minutos)'
            }),
            'days_per_week': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Días por semana'
            }),
            'goal': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Objetivo de la rutina'
            }),
        }
        labels = {
            'name': 'Nombre de la Rutina',
            'description': 'Descripción',
            'time_week': 'Tiempo por Semana (min)',
            'days_per_week': 'Días por Semana',
            'goal': 'Objetivo',
            'coach': 'Entrenador',
            'client': 'Cliente',
            'is_template': 'Es Plantilla',
        }
