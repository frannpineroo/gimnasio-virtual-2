// HeaderComponent básico para que funcione
class HeaderComponent {
    async load() {
        try {
            const response = await fetch('components/header.html');
            if (!response.ok) throw new Error('No se pudo cargar header');
            const html = await response.text();
            
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            return tempDiv.firstElementChild;
        } catch (error) {
            console.warn('Usando header de respaldo:', error);
            return this.createFallbackHeader();
        }
    }

    createFallbackHeader() {
        const header = document.createElement('div');
        header.className = 'header';
        header.innerHTML = `
            <div class="header-content">
                <div class="user-profile-container">
                    <div class="user-profile">
                        <div class="user-avatar">JD</div>
                        <div class="user-info">
                            <h4>Juan Delgado</h4>
                            <p>Entrenador</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return header;
    }
}