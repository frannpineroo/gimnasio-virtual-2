from django.contrib import admin
from .models import Exercise, User, Coach, Client, Asignature, Reminder, TrainingSession, Rutine, DayRutine, ExerciseRutine, ProgressRegister, Equipment

# Register your models here.
admin.site.register(Exercise)
admin.site.register(User)
admin.site.register(Coach)
admin.site.register(Client)
admin.site.register(Asignature)
admin.site.register(Reminder)
admin.site.register(TrainingSession)
admin.site.register(Rutine)
admin.site.register(DayRutine)
admin.site.register(ExerciseRutine)
admin.site.register(ProgressRegister)
admin.site.register(Equipment)