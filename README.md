# Gimnasio Virtual 2

Aplicación web para gestionar entrenadores, clientes, rutinas y ejercicios de un gimnasio (backend en Django + Django REST Framework).

## ✅ ¿Para qué sirve?
Este proyecto proporciona:
- **Gestión de entrenadores y clientes** (creación, edición, listado).
- **Gestión de rutinas y ejercicios** (rutinas compuestas por días y ejercicios, con metas y seguimiento de progreso).
- **API REST** para consumo por un frontend SPA o aplicaciones móviles.
- **Autenticación básica** usando el sistema de usuarios de Django para proteger las rutas.

## 🧱 Stack utilizado
- **Python 3.11**
- **Django 5.2**
- **Django REST Framework** (API REST)
- **PostgreSQL** (recomendado; también funciona con otros motores configurando variables de entorno)
- **whitenoise** (servir estáticos en producción)
- **gunicorn** (servidor WSGI recomendado para despliegue)
- **django-cors-headers** (para permitir requests desde el frontend)

## 🏗 Arquitectura del proyecto
```
├── gym_backend/           # Configuración de Django (settings, urls, wsgi, asgi)
├── entidades/             # App principal (modelos, vistas, serializers, urls)
│   ├── models.py          # Modelo de datos (Client, Coach, Rutine, Exercise, etc.)
│   ├── api_views.py       # Endpoints REST (ViewSets + vistas auxiliares)
│   ├── views.py           # Vistas HTML (templates render)
│   ├── serializers.py     # Serializadores para la API
│   ├── urls.py            # Rutas de la app (API + vistas)
│   └── templates/         # Templates HTML para el panel de entrenadores y clientes
├── requirements.txt       # Dependencias de Python
├── Procfile               # Comando para despliegue en Railway/Heroku
├── runtime.txt            # Versión de Python usada en producción
└── manage.py              # CLI de Django
```

## 🚀 Cómo correr el proyecto (desarrollo)
### 1) Crear entorno virtual
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 2) Instalar dependencias
```powershell
pip install -r requirements.txt
```

### 3) Configurar variables de entorno
Crea un archivo `.env` (no versionar) con al menos estas variables:
```env
SECRET_KEY=una_clave_secreta_segura
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
# Opción 1: conexión completa vía URL
# DATABASE_URL=postgres://usuario:pass@localhost:5432/gimnasio_virtual
# Opción 2: parámetros individuales (si no usas DATABASE_URL)
DB_NAME=gimnasio_virtual
DB_USER=postgres
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=5432
```

> ⚠️ En Windows/PowerShell puedes exportar variables usando `setx` o ejecutar `set` antes de lanzar el servidor.

### 4) Migrar la base de datos
```powershell
python manage.py migrate
```

### 5) (Opcional) Crear superusuario
```powershell
python manage.py createsuperuser
```

### 6) Iniciar servidor
```powershell
python manage.py runserver
```

Abre el navegador en: `http://127.0.0.1:8000/`

## 🔌 Ejemplo de endpoint (API)
La API se expone bajo la ruta base `/entrenador/api/`.

### Ejemplo: listar ejercicios
```http
GET /entrenador/api/ejercicios/?active_only=true&search=press
```

#### Ejemplo con curl (requiere autenticación de Django)
```bash
curl -u tu_usuario:tu_contraseña "http://127.0.0.1:8000/entrenador/api/ejercicios/?active_only=true"
```

### Filtros disponibles (para `/entrenador/api/ejercicios/`)
- `muscle_group`: filtra por id de grupo muscular
- `search`: búsqueda por nombre (`name__icontains`)
- `active_only`: `true` (por defecto) o `false`

## 🧠 Rutas clave (resumen)
- `GET /` – Página de inicio
- `GET /signin/` – Login
- `GET /signup/` – Registro (para entrenadores)
- `GET /entrenador/` – Panel de entrenadores
- `GET /entrenador/api/` – API REST (explorador DRF si estás autenticado)

## 🧪 Despliegue (Railway / Heroku)
Para producción se usa el proceso especificado en `Procfile`:
- `python manage.py migrate`
- `python manage.py collectstatic --noinput`
- `gunicorn gym_backend.wsgi`

Asegúrate de definir `DATABASE_URL`, `SECRET_KEY`, `ALLOWED_HOSTS`, y `DEBUG=False` en el entorno.

---

Si querés, puedo agregar ejemplos de payloads para crear clientes/ejercicios/rutinas o detallar cómo funciona el flujo de autenticación (session-based con Django).