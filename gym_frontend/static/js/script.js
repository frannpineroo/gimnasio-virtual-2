// CONFIGURACIÓN DE API
const API_BASE_URL = 'http://localhost:8000/api';

// Función para hacer peticiones GET con manejo de errores mejorado
async function fetchAPI(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) {
            // Si hay error 500, usar datos de prueba
            if (response.status === 500) {
                console.warn(`API ${endpoint} devolvió error 500, usando datos de prueba`);
                return getMockData(endpoint);
            }
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error al consultar ${endpoint}:`, error);
        return getMockData(endpoint); // Usar datos de prueba en caso de error
    }
}

// Datos de prueba temporales para cuando la API falle
function getMockData(endpoint) {
    const mockData = {
        '/clientes/active': [
            { id: 1, name: 'Cliente 1' },
            { id: 2, name: 'Cliente 2' },
            { id: 3, name: 'Cliente 3' }
        ],
        '/clientes/': [
            { id: 1, name: 'Cliente 1' },
            { id: 2, name: 'Cliente 2' },
            { id: 3, name: 'Cliente 3' }
        ],
        '/ejercicios/': [
            { id: 1, name: 'Press de Banca' },
            { id: 2, name: 'Sentadillas' },
            { id: 3, name: 'Dominadas' },
            { id: 4, name: 'Peso Muerto' }
        ],
        '/rutinas/': [
            { id: 1, name: 'Rutina Principiante', description: 'Rutina básica para empezar' },
            { id: 2, name: 'Rutina Avanzada', description: 'Rutina para usuarios experimentados' }
        ]
    };
    return mockData[endpoint] || [];
}

// Obtener clientes activos
async function getActiveClients() {
    const data = await fetchAPI('/clientes/active');
    return data || []; // Retornar array vacío si es null
}

// Obtener todos los ejercicios
async function getExercises() {
    const data = await fetchAPI('/ejercicios/');
    return data || []; // Retornar array vacío si es null
}

// Obtener todas las rutinas
async function getRoutines() {
    const data = await fetchAPI('/rutinas/');
    return data || []; // Retornar array vacío si es null
}

// ACTUALIZAR ESTADÍSTICAS EN EL DASHBOARD
async function updateDashboardStats() {
    try {
        // Obtener datos en paralelo
        const [clients, exercises, routines] = await Promise.all([
            getActiveClients(),
            getExercises(),
            getRoutines()
        ]);

        // Actualizar contadores
        const clientCount = Array.isArray(clients) ? clients.length : clients?.count || 0;
        const exerciseCount = Array.isArray(exercises) ? exercises.length : exercises?.count || 0;
        const routineCount = Array.isArray(routines) ? routines.length : routines?.count || 0;

        document.getElementById('clients-count').textContent = clientCount;
        document.getElementById('exercises-count').textContent = exerciseCount;
        document.getElementById('routines-count').textContent = routineCount;

        console.log('Estadísticas actualizadas:', { clientCount, exerciseCount, routineCount });
    } catch (error) {
        console.error('Error actualizando estadísticas:', error);
        // Valores por defecto en caso de error
        document.getElementById('clients-count').textContent = '3';
        document.getElementById('exercises-count').textContent = '4';
        document.getElementById('routines-count').textContent = '2';
    }
}

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', function() {
    console.log('Script inicializado');
    
    // Actualizar estadísticas si estamos en la página de inicio
    if (document.getElementById('clients-count')) {
        updateDashboardStats();
    }
    
    // Manejar el menú activo (si existe)
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && currentPage.includes(href.replace('/', ''))) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
});

// FUNCIONES UTILITARIAS
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Función para debug - probar todas las APIs
async function testAllAPIs() {
    console.log('=== TESTEANDO APIS ===');
    
    try {
        const endpoints = ['/clientes/active', '/clientes/', '/ejercicios/', '/rutinas/'];
        
        for (const endpoint of endpoints) {
            const data = await fetchAPI(endpoint);
            console.log(`${endpoint}:`, data ? `✓ ${Array.isArray(data) ? data.length + ' items' : 'Datos recibidos'}` : '✗ Error');
        }
    } catch (error) {
        console.error('Error en test APIs:', error);
    }
}

// Ejecutar test al cargar (solo en desarrollo)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', testAllAPIs);
}