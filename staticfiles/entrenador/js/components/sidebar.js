// SidebarComponent básico para que funcione
class SidebarComponent {
    async load() {
        try {
            // Intentar cargar el sidebar.html
            const response = await fetch('components/sidebar.html');
            if (!response.ok) throw new Error('No se pudo cargar sidebar');
            const html = await response.text();
            
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            return tempDiv.firstElementChild;
        } catch (error) {
            console.warn('Usando sidebar de respaldo:', error);
            return this.createFallbackSidebar();
        }
    }

    createFallbackSidebar() {
        const sidebar = document.createElement('aside');
        sidebar.className = 'sidebar';
        sidebar.innerHTML = `
            <div class="app-name">
                <h1>TRAINING!</h1>
            </div>
            <div class="menu-section-title">Menú</div>
            <div class="menu-items">
                <a href="index.html" class="menu-item active">
                    <i class="fas fa-home"></i><span>Inicio</span>
                </a>
                <a href="clientes.html" class="menu-item">
                    <i class="fas fa-users"></i><span>Clientes</span>
                </a>
                <a href="ejercicios.html" class="menu-item">
                    <i class="fas fa-dumbbell"></i><span>Ejercicios</span>
                </a>
                <a href="rutinas.html" class="menu-item">
                    <i class="fas fa-clipboard-list"></i><span>Rutinas</span>
                </a>
            </div>
        `;
        return sidebar;
    }
}