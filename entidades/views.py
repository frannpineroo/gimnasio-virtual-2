from django.shortcuts import render
from .models import Exercise
from django.shortcuts import render
from django.http import HttpResponseServerError
from django.template import TemplateDoesNotExist



def home_view(request):
    try:
        return render(request, 'entrenador/index.html')
    except TemplateDoesNotExist:
        return HttpResponseServerError("Template entrenador/index.html no encontrado.")

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
    try:
        return render(request, 'entrenador/nuevo-ejercicio.html')
    except TemplateDoesNotExist:
        return HttpResponseServerError("Template entrenador/nuevo-ejercicio.html no encontrado.")

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
    try:
        return render(request, 'entrenador/nueva-rutina.html')
    except TemplateDoesNotExist:
        return HttpResponseServerError("Template entrenador/nueva-rutina.html no encontrado.")

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