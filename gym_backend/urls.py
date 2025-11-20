from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from entidades.views import home_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home_view, name='home'),

    # incluir todas las rutas de la app 'entidades' bajo /entrenador/
    # entidades/urls.py ya contiene las rutas HTML y la subruta 'api/' para la API
    path('entrenador/', include(('entidades.urls', 'entrenador'), namespace='entrenador')),
]

# servir archivos estáticos en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
