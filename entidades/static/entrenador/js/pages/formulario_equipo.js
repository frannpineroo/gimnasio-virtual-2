// entidades/static/entrenador/js/pages/formulario_equipo.js
class FormularioEquipo {
    constructor() {
        this.form = document.getElementById('equipo-form');
        this.urls = {
            list: '/entrenador/equipos/',
            api: '/entrenador/api/equipos/'
        };
        
        if (this.form) {
            this.init();
        }
    }

    init() {
        // Obtener URLs del elemento data
        const urlsElement = document.getElementById('form-urls');
        if (urlsElement) {
            this.urls.list = urlsElement.getAttribute('data-list-url') || this.urls.list;
            this.urls.api = urlsElement.getAttribute('data-api-url') || this.urls.api;
        }
        
        this.initEventListeners();
        this.initValidation();
        this.addCSRFTokenMeta();
        
        // Establecer fecha actual como máximo para la fecha de compra
        const purchaseDateInput = document.getElementById('purchase_date');
        if (purchaseDateInput) {
            const today = new Date().toISOString().split('T')[0];
            purchaseDateInput.max = today;
        }
        
        console.log('Formulario de equipo inicializado');
    }

    addCSRFTokenMeta() {
        const csrfToken = this.getCSRFToken();
        if (csrfToken && !document.querySelector('meta[name="csrf-token"]')) {
            const meta = document.createElement('meta');
            meta.name = 'csrf-token';
            meta.content = csrfToken;
            document.head.appendChild(meta);
        }
    }

    initEventListeners() {
        // Envío del formulario
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Validación en tiempo real
        const inputs = this.form.querySelectorAll('input[required], select[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
        });
        
        // Validación de fecha de compra
        const purchaseDateInput = document.getElementById('purchase_date');
        if (purchaseDateInput) {
            purchaseDateInput.addEventListener('change', () => {
                this.validateField(purchaseDateInput);
            });
        }
    }

    initValidation() {
        // No se necesita validación especial adicional
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        
        // Limpiar error anterior
        this.clearFieldError(field);
        
        if (field.hasAttribute('required') && !value) {
            this.showFieldError(field, 'Este campo es obligatorio');
            isValid = false;
        } else if (field.id === 'purchase_date' && value) {
            const today = new Date().toISOString().split('T')[0];
            if (value > today) {
                this.showFieldError(field, 'La fecha no puede ser futura');
                isValid = false;
            }
        }
        
        return isValid;
    }

    validateForm() {
        const requiredFields = this.form.querySelectorAll('input[required], select[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('is-invalid');
        
        // Remover mensaje de error anterior
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Añadir nuevo mensaje de error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = '#dc3545';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.marginTop = '5px';
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('is-invalid');
        const errorDiv = field.parentNode.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    showLoading(show = true) {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        if (submitBtn) {
            if (show) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
                submitBtn.disabled = true;
            } else {
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Equipo';
                submitBtn.disabled = false;
            }
        }
    }

    showNotification(message, type = 'success') {
        // Crear notificación toast
        const toast = document.createElement('div');
        toast.className = `notification notification-${type}`;
        toast.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Mostrar con animación
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            this.showNotification('Por favor, corrige los errores en el formulario', 'error');
            return;
        }

        this.showLoading();
        
        try {
            await this.saveData();
            
            this.showNotification('Equipo creado correctamente', 'success');
            
            // Redirigir a la lista de equipos después de 1.5 segundos
            setTimeout(() => {
                console.log('Redirigiendo a:', this.urls.list);
                window.location.href = this.urls.list;
            }, 1500);
            
        } catch (error) {
            console.error('Error al guardar:', error);
            this.showNotification('Error al guardar los datos: ' + error.message, 'error');
            this.showLoading(false);
        }
    }

    async saveData() {
        const equipmentData = {
            name: document.getElementById('name').value.trim(),
            category: document.getElementById('category').value.trim(),
            model: document.getElementById('model').value.trim() || null,
            description: document.getElementById('description').value.trim() || null,
            purchase_date: document.getElementById('purchase_date').value || null,
            status: document.getElementById('status').value,
            condition: document.getElementById('condition').value
        };
        
        console.log('Creando equipo:', equipmentData);
        
        const response = await fetch(this.urls.api, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCSRFToken()
            },
            body: JSON.stringify(equipmentData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error del servidor:', errorData);
            
            let errorMessages = [];
            for (const [field, errors] of Object.entries(errorData)) {
                if (Array.isArray(errors)) {
                    // Mostrar el primer error de cada campo
                    const fieldName = this.translateFieldName(field);
                    errorMessages.push(`${fieldName}: ${errors[0]}`);
                } else if (typeof errors === 'string') {
                    errorMessages.push(errors);
                }
            }
            throw new Error(errorMessages.join('; '));
        }
        
        const savedEquipment = await response.json();
        console.log('Equipo creado:', savedEquipment);
        return savedEquipment;
    }

    translateFieldName(field) {
        const translations = {
            'name': 'Nombre',
            'category': 'Categoría',
            'model': 'Modelo',
            'description': 'Descripción',
            'purchase_date': 'Fecha de Compra',
            'status': 'Estado',
            'condition': 'Condición'
        };
        return translations[field] || field;
    }

    getCSRFToken() {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        if (csrfToken) {
            return csrfToken.value;
        }
        
        const metaToken = document.querySelector('meta[name="csrf-token"]');
        if (metaToken) {
            return metaToken.getAttribute('content');
        }
        
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
        return cookieValue || '';
    }
}

// Agregar estilos para notificaciones si no existen
if (!document.querySelector('style[data-notification-styles]')) {
    const notificationStyles = document.createElement('style');
    notificationStyles.setAttribute('data-notification-styles', 'true');
    notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 20px;
        border-radius: 8px;
        background: #000000;
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transform: translateX(150%);
        transition: transform 0.3s ease;
        z-index: 10000;
        max-width: 350px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-success {
        border-left: 4px solid #32CD32;
    }
    
    .notification-error {
        border-left: 4px solid #dc3545;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .notification-content i {
        font-size: 20px;
    }
    
    .notification-success .notification-content i {
        color: #32CD32;
    }
    
    .notification-error .notification-content i {
        color: #dc3545;
    }
    
    .notification-content span {
        color: #ffffff;
        font-weight: 500;
    }
    `;
    document.head.appendChild(notificationStyles);
}

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    new FormularioEquipo();
});