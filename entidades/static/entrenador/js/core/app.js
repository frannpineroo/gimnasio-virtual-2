// APLICACIÓN PRINCIPAL - VERSIÓN DJANGO (SIN AJAX)
class App {
    constructor() {
        this.components = {};
        this.currentPage = this.getCurrentPage();
    }

    async initialize() {
        try {
            await this.initializeCommonComponents();
            await this.delay(100);
            this.initializePageSpecific();
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    async initializeCommonComponents() {
        
        // En Django, los componentes YA están en el DOM
        // Solo inicializamos su funcionalidad JS
        this.components.sidebar = new SidebarComponent();
        this.components.header = new HeaderComponent();
        
        // Solo inicializar funcionalidad - NO cargar via AJAX
        await Promise.all([
            this.components.sidebar.initialize(),  // Cambiado a initialize()
            this.components.header.initialize()    // Cambiado a initialize()
        ]);
    }

    initializePageSpecific() {
        
        const pageScripts = {
            'index': () => this.loadDashboard(),
            'clientes': () => this.initializeClientesPage(),
            'ejercicios': () => this.initializeEjerciciosPage(),
            'rutinas': () => this.initializeRutinasPage(),
            'entrenadores': () => this.initializeEntrenadoresPage(),
            'equipamiento': () => this.initializeEquipamientoPage(),
            '': () => this.loadDashboard(),
            'home': () => this.loadDashboard()
        };

        const initialize = pageScripts[this.currentPage];
        if (initialize) {
            initialize();
        }
    }

    initializeClientesPage() {
        if (window.clientesPage && typeof window.clientesPage.initialize === 'function') {
            window.clientesPage.initialize();
        }
    }

    initializeEjerciciosPage() {
        if (window.ejerciciosPage && typeof window.ejerciciosPage.initialize === 'function') {
            window.ejerciciosPage.initialize();
        }
    }

    initializeRutinasPage() {
        if (window.rutinasPage && typeof window.rutinasPage.initialize === 'function') {
            window.rutinasPage.initialize();
        }
    }

    initializeEntrenadoresPage() {
        if (window.entrenadoresPage && typeof window.entrenadoresPage.initialize === 'function') {
            window.entrenadoresPage.initialize();
        }
    }

    initializeEquipamientoPage() {
        if (window.equipamientoPage && typeof window.equipamientoPage.initialize === 'function') {
            window.equipamientoPage.initialize();
        }
    }

    loadDashboard() {
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').filter(part => part !== '').pop() || 'index';
        return page === '' ? 'index' : page;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Inicializar app cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new App().initialize();
});