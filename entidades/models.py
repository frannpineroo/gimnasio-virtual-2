from django.db import models

class MuscleGroup(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'muscle_groups'
        verbose_name = 'Grupo Muscular'
        verbose_name_plural = 'Grupos Musculares'

class MuscleSubgroup(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    muscle_group = models.ForeignKey(
        MuscleGroup, 
        on_delete=models.CASCADE, 
        related_name='subgroups'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.muscle_group.name} - {self.name}"
    
    class Meta:
        db_table = 'muscle_subgroups'
        verbose_name = 'Subgrupo Muscular'
        verbose_name_plural = 'Subgrupos Musculares'
        unique_together = ['name', 'muscle_group']

class Exercise(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    muscle_group = models.ForeignKey(
        MuscleGroup, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='exercises'
    )
    muscle_subgroup = models.ForeignKey(
        MuscleSubgroup, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='exercises'
    )
    
    def __str__(self):
        return self.name

class User(models.Model):
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.username

class Coach(models.Model):
    name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    dni = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    specialty = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=50, choices=[
        ('active', 'Active'),
        ('inactive', 'Inactive')
    ], default='active')
    hiring_date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='coaches', blank=True, null=True)
    
    class Meta:
        db_table = 'coaches'
        verbose_name = 'Coach'
        verbose_name_plural = 'Coaches'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} {self.last_name}"
    
    @property
    def nombre_completo(self):
        return f"{self.name} {self.last_name}"

class Client(models.Model):
    name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    dni = models.CharField(max_length=20, unique=True, blank=True, null=True)
    email = models.EmailField(unique=True, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    experience_level = models.CharField(max_length=50, choices=[
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced')
    ])
    goal = models.CharField(max_length=100, blank=True, null=True)
    injuries = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, choices=[
        ('active', 'Active'),
        ('inactive', 'Inactive')
    ], default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='clients', blank=True, null=True)
    
    def __str__(self):
        return f"{self.name} {self.last_name}"
    
    class Meta:
        ordering = ['-created_at']

class Asignature(models.Model):
    start_date = models.DateField()
    end_date = models.DateField()
    active = models.BooleanField(default=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='asignatures')
    coach = models.ForeignKey(Coach, on_delete=models.CASCADE, related_name='asignatures')
    
    def __str__(self):
        return f"Asignatura: {self.client} - {self.coach}"

class Reminder(models.Model):
    datetime_reminder = models.DateTimeField()
    sent = models.CharField(max_length=10, choices=[
        ('yes', 'Yes'),
        ('no', 'No')
    ], default='no')
    asignature = models.ForeignKey(Asignature, on_delete=models.CASCADE, related_name='reminders')
    
    def __str__(self):
        return f"Reminder: {self.datetime_reminder}"

class TrainingSession(models.Model):
    create_time = models.DateTimeField(auto_now_add=True)
    notes = models.CharField(max_length=45)
    reminder = models.ForeignKey(Reminder, on_delete=models.CASCADE, related_name='training_sessions')
    
    def __str__(self):
        return f"Session: {self.create_time}"

class Rutine(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    time_week = models.IntegerField()
    days_per_week = models.IntegerField(default=3)
    goal = models.CharField(max_length=100, blank=True, null=True)
    coach = models.ForeignKey(Coach, on_delete=models.SET_NULL, null=True, related_name='routines')
    client = models.ForeignKey('Client', on_delete=models.CASCADE, null=True, blank=True, related_name='routines')
    is_template = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'routines'
        verbose_name = 'Rutina'
        verbose_name_plural = 'Rutinas'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name

class DayRutine(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    order = models.CharField(max_length=45)
    rutine = models.ForeignKey(Rutine, on_delete=models.CASCADE, related_name='day_routines')
    
    def __str__(self):
        return f"{self.name} - {self.rutine.name}"

class ExerciseRutine(models.Model):
    series = models.CharField(max_length=45)
    repetitions = models.CharField(max_length=255)
    type_serie = models.CharField(max_length=45, choices=[
        ('normal', 'Normal'),
        ('drop_set', 'Drop Set'),
        ('superset', 'Superset'),
        ('giant_set', 'Giant Set')
    ])
    dia_rutine = models.ForeignKey(DayRutine, on_delete=models.CASCADE, related_name='exercise_routines')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='exercise_routines')
    
    def __str__(self):
        return f"{self.exercise.name} - {self.dia_rutine.name}"

class ProgressRegister(models.Model):
    body_weight = models.CharField(max_length=255, blank=True, null=True)
    weight_used = models.CharField(max_length=255, blank=True, null=True)
    repetitions_made = models.CharField(max_length=255, blank=True, null=True)
    rm_value = models.CharField(max_length=255, blank=True, null=True)
    session = models.ForeignKey(TrainingSession, on_delete=models.CASCADE, related_name='progress_registers')
    rutine_exercise = models.ForeignKey(ExerciseRutine, on_delete=models.CASCADE, related_name='progress_registers')

    def __str__(self):
        return f"Progress: {self.session} - {self.rutine_exercise}"

class Equipment(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50)
    model = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=50, choices=[
        ('available', 'Available'),
        ('in_maintenance', 'In Maintenance'),
        ('out_of_order', 'Out of Order')
    ])
    purchase_date = models.DateField(blank=True, null=True)
    condition = models.CharField(max_length=20, choices=[
        ('new', 'New'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor')
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name