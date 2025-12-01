// HeaderComponent para Django - SIN AJAX
class HeaderComponent {
    async initialize() {
        try {
            const existingHeader = document.querySelector('.header');
            if (existingHeader) {
                console.log('Header encontrado - inicializando funcionalidad Django');
                this.initializeHeaderFunctionality(existingHeader);
                return true;
            } else {
                console.warn('No se encontró header en el DOM');
                return false;
            }
        } catch (error) {
            console.warn('Error inicializando header:', error);
            return false;
        }
    }

    initializeHeaderFunctionality(headerElement) {
        const userProfile = headerElement.querySelector('.user-profile');
        const userDropdown = headerElement.querySelector('.user-dropdown');
        
        if (userProfile && userDropdown) {
            userProfile.addEventListener('click', () => {
                userDropdown.classList.toggle('show');
            });

            document.addEventListener('click', (e) => {
                if (!userProfile.contains(e.target)) {
                    userDropdown.classList.remove('show');
                }
            });
        }
    }

    // ⚠️ ELIMINADO: load() y createFallbackHeader() - NO SE NECESITAN EN DJANGO
}