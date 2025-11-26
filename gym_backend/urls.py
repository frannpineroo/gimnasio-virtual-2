from django import views
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from entidades.views import home_view, sign_up

urlpatterns = [
    path('admin/', admin.site.urls),
    path('home', home_view, name='home'),
    path('signup/', sign_up, name='signup'),

    # incluir todas las rutas de la app 'entidades' bajo /entrenador/
    # entidades/urls.py ya contiene las rutas HTML y la subruta 'api/' para la API
    path('entrenador/', include(('entidades.urls', 'entrenador'), namespace='entrenador')),
    path('acceso/', include(('entidades.urls', 'acceso'), namespace='acceso')),
]

# servir archivos estáticos en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
