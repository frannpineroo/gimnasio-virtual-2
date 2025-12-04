// SidebarComponent para Django - SIN AJAX
class SidebarComponent {
    async initialize() {
        try {
            const existingSidebar = document.querySelector('.sidebar');
            if (existingSidebar) {
                this.initializeSidebarFunctionality(existingSidebar);
                return true;
            } else {
                console.warn('No se encontró sidebar en el DOM');
                return false;
            }
        } catch (error) {
            console.warn('Error inicializando sidebar:', error);
            return false;
        }
    }

    initializeSidebarFunctionality(sidebarElement) {
        const menuItems = sidebarElement.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                menuItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        const sidebarToggle = document.querySelector('.sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebarElement.classList.toggle('collapsed');
            });
        }
    }

    // ⚠️ ELIMINADO: load() y createFallbackSidebar() - NO SE NECESITAN EN DJANGO
}