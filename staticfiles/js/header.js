// Componente Header
class HeaderComponent {
    constructor() {
        this.headerElement = null;
        this.userDropdownVisible = false;
        this.userData = this.getUserData();
    }

    // Obtener datos del usuario (simulado por ahora)
    getUserData() {
        return {
            name: 'Juan Delgado',
            role: 'Entrenador certificado',
            initials: 'JD'
        };
    }

    // Cargar el header desde el archivo HTML
    async loadHeader() {
        try {
            // ✅ RUTA CORREGIDA - con .html
            const response = await fetch('/entrenador/components/header.html');
            if (!response.ok) {
                throw new Error('No se pudo cargar el header');
            }
            const headerHtml = await response.text();
            
            // Crear elemento temporal para procesar el HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = headerHtml;
            this.headerElement = tempDiv.firstElementChild;
            
            if (!this.headerElement) {
                throw new Error('Estructura del header incorrecta');
            }
            
            // Configurar datos de usuario
            this.setUserData();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            return this.headerElement;
        } catch (error) {
            console.error('Error loading header:', error);
            return this.createFallbackHeader();
        }
    }

    // Establecer datos del usuario en el header
    setUserData() {
        if (this.headerElement) {
            const avatar = this.headerElement.querySelector('#user-avatar');
            const name = this.headerElement.querySelector('#user-name');
            const role = this.headerElement.querySelector('#user-role');
            
            if (avatar) avatar.textContent = this.userData.initials;
            if (name) name.textContent = this.userData.name;
            if (role) role.textContent = this.userData.role;
        }
    }

    // Configurar event listeners para el dropdown de usuario
    setupEventListeners() {
        const toggleButton = this.headerElement.querySelector('#user-menu-toggle');
        const dropdown = this.headerElement.querySelector('#user-dropdown');
        const viewProfile = this.headerElement.querySelector('#view-profile');
        const logout = this.headerElement.querySelector('#logout');
        
        if (toggleButton) {
            toggleButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleUserDropdown();
            });
        }
        
        if (viewProfile) {
            viewProfile.addEventListener('click', () => {
                this.viewProfile();
            });
        }
        
        if (logout) {
            logout.addEventListener('click', () => {
                this.logout();
            });
        }
        
        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (this.userDropdownVisible && 
                !e.target.closest('.user-profile-container')) {
                this.hideUserDropdown();
            }
        });
    }

    // Mostrar/ocultar dropdown de usuario
    toggleUserDropdown() {
        const dropdown = this.headerElement.querySelector('#user-dropdown');
        if (dropdown) {
            if (this.userDropdownVisible) {
                dropdown.classList.remove('show');
            } else {
                dropdown.classList.add('show');
            }
            this.userDropdownVisible = !this.userDropdownVisible;
        }
    }

    hideUserDropdown() {
        const dropdown = this.headerElement.querySelector('#user-dropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
            this.userDropdownVisible = false;
        }
    }

    // Acción: Ver perfil
    viewProfile() {
        alert('Redirigiendo a perfil de usuario...');
        this.hideUserDropdown();
    }

    // Acción: Cerrar sesión
    logout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            alert('Sesión cerrada. Redirigiendo al login...');
        }
        this.hideUserDropdown();
    }

    // Crear un header de respaldo si falla la carga
    createFallbackHeader() {
        const header = document.createElement('div');
        header.className = 'header';
        header.innerHTML = `
            <div class="header-content">
                <div class="user-profile-container">
                    <div class="user-profile" id="user-profile">
                        <div class="user-avatar" id="user-avatar">${this.userData.initials}</div>
                        <div class="user-info">
                            <h4 id="user-name">${this.userData.name}</h4>
                            <p id="user-role">${this.userData.role}</p>
                        </div>
                        <i class="fas fa-chevron-down" id="user-menu-toggle"></i>
                    </div>
                    
                    <div class="user-dropdown" id="user-dropdown">
                        <div class="dropdown-item" id="view-profile">
                            <i class="fas fa-user"></i>
                            <span>Ver Perfil</span>
                        </div>
                        <div class="dropdown-item" id="logout">
                            <i class="fas fa-sign-out-alt"></i>
                            <span>Cerrar Sesión</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Configurar event listeners para el header de respaldo
        setTimeout(() => {
            this.headerElement = header;
            this.setupEventListeners();
        }, 0);
        
        return header;
    }
}