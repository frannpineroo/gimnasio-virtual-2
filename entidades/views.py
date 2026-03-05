# views.py
from django.shortcuts import render, redirect
from django.http import HttpResponseServerError
from django.template import TemplateDoesNotExist
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User as AuthUser
from django.contrib.auth import login, logout, authenticate
from django.db import IntegrityError
from .forms import ExerciseForm, RutineForm
from django.contrib.auth.decorators import login_required
from .models import Coach, Client, User as CustomUser
from functools import wraps
from .models import Rutine, UserProfile
from django.shortcuts import render, redirect, get_object_or_404


def coach_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('entrenador:signin')
        try:
            if request.user.profile.role == UserProfile.CLIENT:
                return redirect('entrenador:cliente_home')
        except UserProfile.DoesNotExist:
            pass
        return view_func(request, *args, **kwargs)
    return wrapper

def sign_up(request):
    if request.method == 'GET':
        return render(request, 'acceso/signup.html', {
            'form': UserCreationForm()
        })
    else:
        if request.POST['password1'] == request.POST['password2']:
            try:
                user = AuthUser.objects.create_user(
                    username=request.POST['username'],
                    password=request.POST['password1']
                )
                # El signup publico siempre crea coaches
                UserProfile.objects.create(user=user, role=UserProfile.COACH)
                login(request, user)
                return redirect('entrenador:home')
            except IntegrityError:
                return render(request, 'acceso/signup.html', {
                    'form': UserCreationForm(),
                    'error': 'El nombre del usuario ya existe.'
                })
        return render(request, 'acceso/signup.html', {
                    'form': UserCreationForm(),
                    'error': 'Las contraseñas no coinciden.'
                })


@login_required
def signout(request):
    logout(request)
    return redirect('entrenador:signin')


def signin(request):
    if request.method == 'GET':
        return render(request, 'acceso/signin.html', {
            'form': AuthenticationForm()
        })
    else:
        user = authenticate(
            request,
            username=request.POST['username'],
            password=request.POST['password']
        )
        if user is None:
            return render(request, 'acceso/signin.html', {
                'form': AuthenticationForm(),
                'error': 'El nombre de usuario o la contraseña son incorrectos.'
            })
        else:
            login(request, user)
            try:
                if user.profile.role == UserProfile.CLIENT:
                    return redirect('entrenador:cliente_home')
            except UserProfile.DoesNotExist:
                pass

            return redirect('entrenador:home')


def get_user_profile_context(request):
    """Obtiene la información del perfil del usuario actual"""
    user = request.user
    context = {}
    
    if user.is_authenticated:
        # Buscar usuario personalizado por username
        try:
            custom_user = CustomUser.objects.get(username=user.username)
            
            # Intentar obtener el perfil de coach
            try:
                coach = Coach.objects.get(user=custom_user)
                context['user_profile'] = {
                    'name': coach.name,
                    'last_name': coach.last_name,
                    'full_name': f"{coach.name} {coach.last_name}",
                    'initials': f"{coach.name[0]}{coach.last_name[0]}" if coach.name and coach.last_name else 'US',
                    'role': 'Entrenador',
                    'type': 'coach'
                }
            except Coach.DoesNotExist:
                # Intentar obtener el perfil de cliente
                try:
                    client = Client.objects.get(user=custom_user)
                    context['user_profile'] = {
                        'name': client.name,
                        'last_name': client.last_name,
                        'full_name': f"{client.name} {client.last_name}",
                        'initials': f"{client.name[0]}{client.last_name[0]}" if client.name and client.last_name else 'CL',
                        'role': 'Cliente',
                        'type': 'client'
                    }
                except Client.DoesNotExist:
                    # Si no tiene perfil, usar el usuario personalizado
                    context['user_profile'] = {
                        'name': custom_user.first_name,
                        'last_name': custom_user.last_name,
                        'full_name': f"{custom_user.first_name} {custom_user.last_name}" if custom_user.first_name and custom_user.last_name else custom_user.username,
                        'initials': f"{custom_user.first_name[0]}{custom_user.last_name[0]}" if custom_user.first_name and custom_user.last_name else custom_user.username[:2].upper(),
                        'role': 'Usuario',
                        'type': 'user'
                    }
        except CustomUser.DoesNotExist:
            # Si no existe usuario personalizado, usar el usuario de Django
            context['user_profile'] = {
                'name': user.first_name,
                'last_name': user.last_name,
                'full_name': f"{user.first_name} {user.last_name}" if user.first_name and user.last_name else user.username,
                'initials': f"{user.first_name[0]}{user.last_name[0]}" if user.first_name and user.last_name else user.username[:2].upper(),
                'role': 'Usuario',
                'type': 'user'
            }
    
    return context


@coach_required
def home_view(request):
    try:
        context = get_user_profile_context(request)
        return render(request, 'entrenador/home.html', context)
    except TemplateDoesNotExist:
        return HttpResponseServerError("Template entrenador/home.html no encontrado.")


@coach_required
def clients_page(request):
    try:
        context = get_user_profile_context(request)
        return render(request, 'entrenador/clientes.html', context)
    except TemplateDoesNotExist:
        return HttpResponseServerError("Template entrenador/clientes.html no encontrado.")


@coach_required
def new_client(request):
    try:
        context = get_user_profile_context(request)
        return render(request, 'entrenador/nuevo-cliente.html', context)
    except TemplateDoesNotExist:
        return HttpResponseServerError("Template entrenador/nuevo-cliente.html no encontrado.")


@coach_required
def exercise_page(request):
    try:
        context = get_user_profile_context(request)
        return render(request, 'entrenador/ejercicios.html', context)
    except TemplateDoesNotExist:
        return HttpResponseServerError("Template entrenador/ejercicios.html no encontrado.")


@coach_required
def new_exercise(request):
    if request.method == 'POST':
        form = ExerciseForm(request.POST)
        if form.is_valid():
            exercise = form.save()
            form = ExerciseForm()
            context = get_user_profile_context(request)
            context.update({
                'form': form,
                'success': True,
                'mensaje': 'Ejercicio guardado correctamente.'
            })
            return render(request, 'entrenador/nuevo-ejercicio.html', context)
        else:
            context = get_user_profile_context(request)
            context.update({
                'form': form,
                'error': True
            })
            return render(request, 'entrenador/nuevo-ejercicio.html', context)

    form = ExerciseForm()
    context = get_user_profile_context(request)
    context.update({
        'form': form
    })
    return render(request, 'entrenador/nuevo-ejercicio.html', context)


@coach_required
def trainers_page(request):
    try:
        context = get_user_profile_context(request)
        return render(request, 'entrenador/entrenador.html', context)
    except TemplateDoesNotExist:
        return HttpResponseServerError("Template entrenador/entrenador.html no encontrado.")


@coach_required
def new_trainer(request):
    try:
        context = get_user_profile_context(request)
        return render(request, 'entrenador/nuevo-entrenador.html', context)
    except TemplateDoesNotExist:
        return HttpResponseServerError("Template entrenador/nuevo-entrenador.html no encontrado.")


@coach_required
def routine_page(request):
    try:
        context = get_user_profile_context(request)
        # No pasamos rutinas aquí, se cargan via JavaScript/API
        return render(request, 'entrenador/rutinas.html', context)
    except TemplateDoesNotExist:
        return HttpResponseServerError("Template entrenador/rutinas.html no encontrado.")
    
@coach_required
def new_routine(request):
    from .models import Coach, Client
    context = get_user_profile_context(request)
    context.update({
        'coaches': Coach.objects.filter(status='active'),
        'clients': Client.objects.filter(status='active'),
    })
    return render(request, 'entrenador/nueva-rutina.html', context)

@coach_required
def equipment_page(request):
    try:
        context = get_user_profile_context(request)
        return render(request, 'entrenador/equipos.html', context)
    except TemplateDoesNotExist:
        return HttpResponseServerError("Template entrenador/equipos.html no encontrado.")


@coach_required
def new_equipment(request):
    try:
        context = get_user_profile_context(request)
        return render(request, 'entrenador/nuevo-equipo.html', context)
    except TemplateDoesNotExist:
        return HttpResponseServerError("Template entrenador/nuevo-equipo.html no encontrado.")


@coach_required
def muscles_page(request):
    try:
        context = get_user_profile_context(request)
        return render(request, 'entrenador/musculos.html', context)
    except TemplateDoesNotExist:
        return HttpResponseServerError("Template entrenador/musculos.html no encontrado.")

from django.shortcuts import get_object_or_404

@coach_required
def edit_routine(request, routine_id):
    rutina = get_object_or_404(Rutine, id=routine_id)
    
    if request.method == 'POST':
        form = RutineForm(request.POST, instance=rutina)
        if form.is_valid():
            form.save()
            context = get_user_profile_context(request)
            context.update({
                'form': form,
                'rutina': rutina,
                'editing': True,
                'success': True,
                'mensaje': 'Rutina actualizada correctamente.'
            })
            return render(request, 'entrenador/nueva-rutina.html', context)
        else:
            context = get_user_profile_context(request)
            context.update({
                'form': form,
                'rutina': rutina,
                'editing': True,
                'error': True
            })
            return render(request, 'entrenador/nueva-rutina.html', context)
    else:
        form = RutineForm(instance=rutina)
        context = get_user_profile_context(request)
        context.update({
            'form': form,
            'rutina': rutina,
            'editing': True
        })
        return render(request, 'entrenador/nueva-rutina.html', context)


@coach_required
def delete_routine(request, routine_id):
    rutina = get_object_or_404(Rutine, id=routine_id)
    rutina.delete()
    return redirect('entrenador:rutinas')

def cliente_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('entrenador:signin')
        try:
            if request.user.profile.role != UserProfile.CLIENT:
                return redirect('entrenador:home')
        except UserProfile.DoesNotExist:
            return redirect('entrenador:signin')
        return view_func(request, *args, **kwargs)
    return wrapper

@cliente_required
def cliente_home(request):
    from .models import Client, Rutine

    context = get_user_profile_context(request)
    client = None
    active_routine = None

    try:
        # Buscar el cliente directamente por email del auth_user
        client = Client.objects.get(email=request.user.email)
        active_routine = Rutine.objects.filter(client=client).order_by('created_at').first
    except Client.DoesNotExist:
        pass

    context.update({
        'client': client,
        'active_routine': active_routine,
    })

    return render(request, 'cliente/index.html', context)


@cliente_required
def cliente_entrenamiento(request):
    context = get_user_profile_context(request)
    return render(request, 'cliente/entrenamiento.html', context)


@cliente_required
def cliente_progreso(request):
    context = get_user_profile_context(request)
    return render(request, 'cliente/progreso.html', context)


@cliente_required
def cliente_nuevo_registro(request):
    context = get_user_profile_context(request)
    return render(request, 'cliente/nuevo-registro.html', context)