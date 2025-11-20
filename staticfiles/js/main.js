// Archivo principal que inicializa la aplicación
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Inicializar componentes
        await initializeComponents();
        
        // Inicializar estadísticas del dashboard (si estamos en la página de inicio)
        if (typeof updateDashboardStats === 'function') {
            await updateDashboardStats();
        }
        
        console.log('Aplicación inicializada correctamente');
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
    }
});

// Inicializar componentes comunes
async function initializeComponents() {
    try {
        // Cargar sidebar
        const sidebarComponent = new SidebarComponent();
        const sidebarElement = await sidebarComponent.loadSidebar();
        
        // Insertar sidebar al inicio del body
        if (sidebarElement) {
            document.body.insertBefore(sidebarElement, document.body.firstChild);
        }
        
        // Cargar header
        const headerComponent = new HeaderComponent();
        const headerElement = await headerComponent.loadHeader();
        
        // Insertar header en el main-content
        const mainContent = document.querySelector('.main-content');
        if (mainContent && headerElement) {
            mainContent.insertBefore(headerElement, mainContent.firstChild);
        } else if (headerElement) {
            // Fallback: insertar al inicio del body si no hay main-content
            document.body.insertBefore(headerElement, document.body.firstChild);
        }
        
        console.log('Componentes cargados correctamente');
    } catch (error) {
        console.error('Error inicializando componentes:', error);
    }
}

// Función para manejar errores globales
window.addEventListener('error', function(e) {
    console.error('Error global capturado:', e.error);
});

// Función para manejar promesas rechazadas no capturadas
window.addEventListener('unhandledrejection', function(e) {
    console.error('Promesa rechazada no capturada:', e.reason);
});