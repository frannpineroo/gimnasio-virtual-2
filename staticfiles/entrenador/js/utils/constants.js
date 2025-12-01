// Constantes básicas para que funcione la app
const AppConstants = {
    // Rutas base
    BASE_PATH: window.location.pathname.includes('/entrenador/') ? '/entrenador/' : '/',
    
    // Estados
    STATUS: {
        ACTIVE: 'activo',
        INACTIVE: 'inactivo'
    },
    
    // Tipos de datos
    DATA_TYPES: {
        CLIENTS: 'clientes',
        EXERCISES: 'ejercicios',
        ROUTINES: 'rutinas'
    }
};