// Componente Sidebar
class SidebarComponent {
    constructor() {
        this.sidebarElement = null;
        this.currentPage = this.getCurrentPage();
    }

    // Obtener la página actual basada en la URL
    getCurrentPage() {
        const path = window.location.pathname;
        if (path.endsWith('/entrenador/') || path === '/entrenador/') return 'inicio';
        if (path.includes('/clientes/')) return 'clientes';
        if (path.includes('/ejercicios/')) return 'ejercicios';
        if (path.includes('/rutinas/')) return 'rutinas';
        if (path.includes('/equipos/')) return 'equipos';
        if (path.includes('/entrenadores/')) return 'entrenador';
        return 'inicio';
    }

    // Cargar el sidebar desde el archivo HTML
    async loadSidebar() {
        try {
            // ✅ RUTA CORREGIDA - con .html
            const response = await fetch('/entrenador/components/sidebar.html');
            if (!response.ok) {
                throw new Error('No se pudo cargar el sidebar');
            }
            const sidebarHtml = await response.text();
            
            // Crear elemento temporal para procesar el HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = sidebarHtml;
            this.sidebarElement = tempDiv.querySelector('.sidebar');
            
            if (!this.sidebarElement) {
                throw new Error('Estructura del sidebar incorrecta');
            }
            
            // Marcar elemento activo
            this.setActiveMenuItem();
            
            return this.sidebarElement;
        } catch (error) {
            console.error('Error loading sidebar:', error);
            return this.createFallbackSidebar();
        }
    }

    // Establecer el elemento de menú activo
    setActiveMenuItem() {
        const menuItem = this.sidebarElement.querySelector(`#menu-${this.currentPage}`);
        if (menuItem) {
            menuItem.classList.add('active');
        }
    }

    // Crear un sidebar de respaldo si falla la carga
    createFallbackSidebar() {
        const sidebar = document.createElement('aside');
        sidebar.className = 'sidebar';
        sidebar.innerHTML = `
            <div class="app-name">
                <h1>TRAINING!</h1>
            </div>
            <div class="menu-section-title">Menú</div>
            <div class="menu-items">
                <a href="/entrenador/" class="menu-item ${this.currentPage === 'inicio' ? 'active' : ''}" id="menu-inicio">
                    <i class="fas fa-home"></i><span>Inicio</span>
                </a>
                <a href="/entrenador/clientes/" class="menu-item ${this.currentPage === 'clientes' ? 'active' : ''}" id="menu-clientes">
                    <i class="fas fa-users"></i><span>Clientes</span>
                </a>
                <a href="/entrenador/ejercicios/" class="menu-item ${this.currentPage === 'ejercicios' ? 'active' : ''}" id="menu-ejercicios">
                    <i class="fas fa-dumbbell"></i><span>Ejercicios</span>
                </a>
                <a href="/entrenador/rutinas/" class="menu-item ${this.currentPage === 'rutinas' ? 'active' : ''}" id="menu-rutinas">
                    <i class="fas fa-clipboard-list"></i><span>Rutinas</span>
                </a>
            </div>
        `;
        return sidebar;
    }

    // Método para actualizar el elemento activo si la página cambia
    updateActiveMenuItem() {
        // Remover clase active de todos los items
        const allMenuItems = this.sidebarElement.querySelectorAll('.menu-item');
        allMenuItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Actualizar la página actual
        this.currentPage = this.getCurrentPage();
        
        // Agregar clase active al item correspondiente
        this.setActiveMenuItem();
    }

    // Método para agregar un nuevo item al sidebar
    addMenuItem(title, href, iconClass, id) {
        const menuItems = this.sidebarElement.querySelector('.menu-items');
        if (menuItems) {
            const newItem = document.createElement('a');
            newItem.href = href;
            newItem.className = 'menu-item';
            newItem.id = `menu-${id}`;
            newItem.innerHTML = `<i class="${iconClass}"></i><span>${title}</span>`;
            
            menuItems.appendChild(newItem);
            
            // Si es la página actual, marcar como activa
            if (this.currentPage === id) {
                newItem.classList.add('active');
            }
        }
    }

    // Método para inicializar event listeners en los items del menú
    initMenuListeners() {
        const menuItems = this.sidebarElement.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Remover clase active de todos los items
                menuItems.forEach(i => i.classList.remove('active'));
                
                // Agregar clase active al item clickeado
                e.currentTarget.classList.add('active');
            });
        });
    }
}