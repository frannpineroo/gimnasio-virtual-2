from django.shortcuts import render, redirect
from django.http import HttpResponseServerError
from django.template import TemplateDoesNotExist
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User
from django.contrib.auth import login, logout, authenticate
from django.db import IntegrityError
from .forms import ExerciseForm, RutineForm

def sign_up(request):
    if request.method == 'GET':
        return render(request, 'acceso/signup.html', {
            'form': UserCreationForm()
        })
    else:
        if request.POST['password1'] == request.POST['password2']:
            # registrar usuario
            try:
                user = User.objects.create_user(
                username=request.POST['username'],
                password=request.POST['password1'])
                user.save()
                login(request, user)
                return redirect('home')
            except IntegrityError:
                return render(request, 'acceso/signup.html', {
                    'form': UserCreationForm(),
                    'error': 'El nombre del usaurio ya existe.'
                })
        return render(request, 'acceso/signup.html', {
                    'form': UserCreationForm(),
                    'error': 'Las contraseñas no coinciden.'
                })
    
def signout(request):
    logout(request)
    return(redirect('acceso/signin.html'))

def signin(request):
    if request.method == 'GET':
        return render(request, 'acceso/signin.html', {
            'form': AuthenticationForm()
        })
    else:
        user = authenticate(request, username=request.POST['username'], password=request.POST['password'])
        if user is None:
            return render(request, 'acceso/signin.html', {
                'form': AuthenticationForm(),
                'error': 'El nombre de usuario o la contraseña son incorrectos.'
            })
        else:
            login(request, user)
            return redirect('home')

def home_view(request):
    try:
        return render(request, 'entrenador/home.html')
    except TemplateDoesNotExist:
        return HttpResponseServerError("Template entrenador/home.html no encontrado.")

def clients_page(request):
    try:
        return render(request, 'entrenador/clientes.html')
    except TemplateDoesNotExist:
        return HttpResponseServerError("Template entrenador/clientes.html no encontrado.")

def new_client(request):
    try:
        return render(request, 'entrenador/nuevo-cliente.html')
    except TemplateDoesNotExist:
        return HttpResponseServerError("Template entrenador/nuevo-cliente.html no encontrado.")

def exercise_page(request):
    try:
        return render(request, 'entrenador/ejercicios.html')
    except TemplateDoesNotExist:
        return HttpResponseServerError("Template entrenador/ejercicios.html no encontrado.")

def new_exercise(request):
    if request.method == 'POST':
        form = ExerciseForm(request.POST)
        if form.is_valid():
            form.save()
            form = ExerciseForm()
            mensaje = "Ejercicio guardado correctamente."
            return render(request, 'entrenador/nuevo-ejercicio.html', {
                'form': form,
                'mensaje': mensaje
            })
        else:
            return render(request, 'entrenador/nuevo-ejercicio.html', {
                'form': form
            })

    form = ExerciseForm()
    return render(request, 'entrenador/nuevo-ejercicio.html', {
        'form': form
    })

def trainers_page(request):
    try:
        return render(request, 'entrenador/entrenador.html')
    except TemplateDoesNotExist:
        return HttpResponseServerError("Template entrenador/entrenador.html no encontrado.")

def new_trainer(request):
    try:
        return render(request, 'entrenador/nuevo-entrenador.html')
    except TemplateDoesNotExist:
        return HttpResponseServerError("Template entrenador/nuevo-entrenador.html no encontrado.")

def routine_page(request):
    try:
        return render(request, 'entrenador/rutinas.html')
    except TemplateDoesNotExist:
        return HttpResponseServerError("Template entrenador/rutina.html no encontrado.")

def new_routine(request):
    if request.method == 'POST':
        form = RutineForm(request.POST)
        if form.is_valid():
            form.save()
            form = RutineForm()
            mensaje = "Rutina guardada correctamente."
            return render(request, 'entrenador/nueva-rutina.html', {
                'form': form,
                'mensaje': mensaje
            })
        else:
            return render(request, 'entrenador/nueva-rutina.html', {
                'form': form
            })

    form = RutineForm()
    return render(request, 'entrenador/nueva-rutina.html', {
        'form': form
    })

def equipment_page(request):
    try:
        return render(request, 'entrenador/equipos.html')
    except TemplateDoesNotExist:
        return HttpResponseServerError("Template entrenador/equipos.html no encontrado.")

def new_equipment(request):
    try:
        return render(request, 'entrenador/nuevo-equipo.html')
    except TemplateDoesNotExist:
        return HttpResponseServerError("Template entrenador/nuevo-equipo.html no encontrado.")

# Nueva vista para la página de músculos
def muscles_page(request):
    try:
        return render(request, 'entrenador/musculos.html')
    except TemplateDoesNotExist:
        return HttpResponseServerError("Template entrenador/musculos.html no encontrado.")