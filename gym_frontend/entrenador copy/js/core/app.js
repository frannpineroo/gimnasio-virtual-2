// APLICACIÓN PRINCIPAL - CARGA OPTIMIZADA
class App {
    constructor() {
        this.components = {};
        this.currentPage = this.getCurrentPage();
    }

    async initialize() {
        try {
            await this.loadCommonComponents();
            // Esperar un poco para que los scripts de página se carguen
            await this.delay(100);
            this.initializePageSpecific();
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    async loadCommonComponents() {
        // Cargar componentes comunes UNA sola vez
        this.components.sidebar = new SidebarComponent();
        this.components.header = new HeaderComponent();
        
        const [sidebarElement, headerElement] = await Promise.all([
            this.components.sidebar.load(),
            this.components.header.load()
        ]);

        // Insertar en el DOM
        document.body.insertBefore(sidebarElement, document.body.firstChild);
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent && headerElement) {
            mainContent.insertBefore(headerElement, mainContent.firstChild);
        }
    }

    initializePageSpecific() {
    console.log('Initializing page:', this.currentPage);
    
    const pageScripts = {
        'index': () => this.loadDashboard(),
        'clientes': () => this.initializeClientesPage(),
        'ejercicios': () => this.initializeEjerciciosPage(),
        'rutinas': () => this.initializeRutinasPage(),
        'entrenadores': () => this.initializeEntrenadoresPage(),
        'equipamiento': () => this.initializeEquipamientoPage()
    };

        const initialize = pageScripts[this.currentPage];
        if (initialize) {
            initialize();
        }
    }

    initializeClientesPage() {
        if (window.clientesPage && typeof window.clientesPage.initialize === 'function') {
            console.log('Initializing clientes page');
            window.clientesPage.initialize();
        } else {
            console.error('clientesPage not found or initialize method missing');
            // Reintentar después de un delay
            setTimeout(() => this.initializeClientesPage(), 200);
        }
    }

    initializeEjerciciosPage() {
        if (window.ejerciciosPage && typeof window.ejerciciosPage.initialize === 'function') {
            console.log('Initializing ejercicios page');
            window.ejerciciosPage.initialize();
        } else {
            console.error('ejerciciosPage not found or initialize method missing');
            // Reintentar después de un delay
            setTimeout(() => this.initializeEjerciciosPage(), 200);
        }
    }

    initializeRutinasPage() {
        if (window.rutinasPage && typeof window.rutinasPage.initialize === 'function') {
            console.log('Initializing rutinas page');
            window.rutinasPage.initialize();
        } else {
            console.error('rutinasPage not found or initialize method missing');
            // Reintentar después de un delay
            setTimeout(() => this.initializeRutinasPage(), 200);
        }
    }

    initializeEntrenadoresPage() {
    if (window.entrenadoresPage && typeof window.entrenadoresPage.initialize === 'function') {
        console.log('Initializing entrenadores page');
        window.entrenadoresPage.initialize();
        } else {
            console.error('entrenadoresPage not found or initialize method missing');
            setTimeout(() => this.initializeEntrenadoresPage(), 200);
        }
    }

    initializeEquipamientoPage() {
        if (window.equipamientoPage && typeof window.equipamientoPage.initialize === 'function') {
            console.log('Initializing equipamiento page');
            window.equipamientoPage.initialize();
        } else {
            console.error('equipamientoPage not found or initialize method missing');
            setTimeout(() => this.initializeEquipamientoPage(), 200);
        }
    }

    loadDashboard() {
        // Dashboard tiene lógica simple
        console.log('Dashboard loaded');
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '') || 'index';
        return page === 'index' ? 'index' : page;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Inicializar app cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new App().initialize();
});