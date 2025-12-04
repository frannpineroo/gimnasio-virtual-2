// entidades/static/entrenador/js/pages/formulario_entrenador.js
class FormularioEntrenador {
    constructor() {
        this.form = document.getElementById('entrenador-form');
        this.urls = {
            list: '/entrenador/entrenadores/'  // Valor por defecto
        };
        
        if (this.form) {
            this.init();
        }
    }

    init() {
        // Obtener URLs del elemento data
        const urlsElement = document.getElementById('urls-data');
        if (urlsElement) {
            this.urls.list = urlsElement.getAttribute('data-list-url') || this.urls.list;
        }
        
        this.initEventListeners();
        this.initValidation();
        this.addCSRFTokenMeta();
    }

    addCSRFTokenMeta() {
        // Asegurarse de que hay un token CSRF accesible
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
    }

    initValidation() {
        // Validación de DNI (solo números y letras)
        const dniInput = document.getElementById('dni');
        if (dniInput) {
            dniInput.addEventListener('input', () => {
                dniInput.value = dniInput.value.toUpperCase();
            });
        }

        // Validación de teléfono
        const telefonoInput = document.getElementById('phone');
        if (telefonoInput) {
            telefonoInput.addEventListener('input', () => {
                telefonoInput.value = telefonoInput.value.replace(/[^0-9+\-\s]/g, '');
            });
        }
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        
        // Limpiar error anterior
        this.clearFieldError(field);
        
        if (field.hasAttribute('required') && !value) {
            this.showFieldError(field, 'Este campo es obligatorio');
            isValid = false;
        } else if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showFieldError(field, 'Por favor, ingresa un email válido');
                isValid = false;
            }
        } else if (field.id === 'dni' && value) {
            if (value.length < 5 || value.length > 20) {
                this.showFieldError(field, 'El DNI debe tener entre 5 y 20 caracteres');
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
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Entrenador';
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
            
            this.showNotification('Entrenador guardado correctamente', 'success');
            
            // Redirigir a la lista de entrenadores después de 1.5 segundos
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
        const coachData = {
            name: document.getElementById('name').value.trim(),
            last_name: document.getElementById('last_name').value.trim(),
            dni: document.getElementById('dni').value.trim() || null,
            email: document.getElementById('email').value.trim() || null,
            phone: document.getElementById('phone').value.trim() || null,
            specialty: document.getElementById('specialty').value.trim() || null,
            status: document.getElementById('status').value || 'active'
        };
        
        console.log('Guardando entrenador:', coachData);
        
        const response = await fetch('/entrenador/api/entrenadores/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCSRFToken()
            },
            body: JSON.stringify(coachData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error del servidor:', errorData);
            
            // Mostrar errores de validación del servidor
            if (errorData) {
                let errorMessages = [];
                for (const [field, errors] of Object.entries(errorData)) {
                    if (Array.isArray(errors)) {
                        // Mostrar el primer error de cada campo
                        const fieldName = this.translateFieldName(field);
                        errorMessages.push(`${fieldName}: ${errors[0]}`);
                    } else if (typeof errors === 'string') {
                        errorMessages.push(errors);
                    } else {
                        errorMessages.push(`${field}: ${JSON.stringify(errors)}`);
                    }
                }
                throw new Error(errorMessages.join('; '));
            }
            
            throw new Error('Error al guardar el entrenador');
        }
        
        const savedCoach = await response.json();
        console.log('Entrenador guardado:', savedCoach);
        return savedCoach;
    }

    translateFieldName(field) {
        const translations = {
            'name': 'Nombre',
            'last_name': 'Apellido',
            'dni': 'DNI',
            'email': 'Email',
            'phone': 'Teléfono',
            'specialty': 'Especialidad',
            'status': 'Estado'
        };
        return translations[field] || field;
    }

    getCSRFToken() {
        // Primero buscar en un input hidden
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        if (csrfToken) {
            return csrfToken.value;
        }
        
        // Buscar en meta tag
        const metaToken = document.querySelector('meta[name="csrf-token"]');
        if (metaToken) {
            return metaToken.getAttribute('content');
        }
        
        // Fallback: buscar en cookies
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
    new FormularioEntrenador();
});