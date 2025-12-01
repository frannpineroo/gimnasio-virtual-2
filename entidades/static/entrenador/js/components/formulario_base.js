// entidades/static/entrenador/js/components/formulario_base.js
class FormularioBase {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.initEventListeners();
        this.initDatePickers();
        this.initValidation();
    }

    initEventListeners() {
        // Validación en tiempo real
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Envío del formulario
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Prevenir recarga de página al presionar Enter en campos individuales
        this.form.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && !e.target.closest('.form-actions')) {
                e.preventDefault();
            }
        });
    }

    initDatePickers() {
        // Configurar fechas máximas/minimas si es necesario
        const dateInputs = this.form.querySelectorAll('input[type="date"]');
        dateInputs.forEach(input => {
            if (!input.max) {
                const today = new Date().toISOString().split('T')[0];
                input.max = today;
            }
        });
    }

    initValidation() {
        // Sobreescribir en clases hijas
    }

    validateField(field) {
        if (!field.required && !field.value.trim()) {
            this.clearError(field);
            return true; // No requerido y vacío, es válido
        }

        let isValid = true;
        let errorMessage = '';

        // Validaciones específicas por tipo de campo
        if (field.type === 'email' && field.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value.trim())) {
                isValid = false;
                errorMessage = 'Por favor, ingresa un email válido';
            }
        }

        if (field.type === 'url' && field.value.trim()) {
            try {
                new URL(field.value);
            } catch {
                isValid = false;
                errorMessage = 'Por favor, ingresa una URL válida';
            }
        }

        if (field.required && !field.value.trim()) {
            isValid = false;
            errorMessage = 'Este campo es requerido';
        }

        if (field.type === 'number') {
            const value = field.value.trim();
            if (value && isNaN(value)) {
                isValid = false;
                errorMessage = 'Por favor, ingresa un número válido';
            }
        }

        this.setFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    setFieldValidation(field, isValid, message) {
        field.classList.remove('is-invalid', 'is-valid');
        
        if (!isValid) {
            field.classList.add('is-invalid');
            this.showError(field, message);
        } else if (field.value.trim()) {
            field.classList.add('is-valid');
            this.clearError(field);
        } else {
            this.clearError(field);
        }
    }

    showError(field, message) {
        this.clearError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        errorDiv.id = `${field.id}-error`;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearError(field) {
        const existingError = field.parentNode.querySelector(`#${field.id}-error`);
        if (existingError) {
            existingError.remove();
        }
    }

    clearFieldError(field) {
        if (field.classList.contains('is-invalid')) {
            field.classList.remove('is-invalid');
            this.clearError(field);
        }
    }

    validateForm() {
        let isValid = true;
        const requiredFields = this.form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    showLoading(show = true) {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        if (submitBtn) {
            if (show) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
                submitBtn.disabled = true;
            } else {
                const btnText = submitBtn.getAttribute('data-original-text') || 'Guardar';
                submitBtn.innerHTML = `<i class="fas fa-save"></i> ${btnText}`;
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
            
            this.showNotification('Datos guardados correctamente', 'success');
            
            // Redirigir después de 1.5 segundos
            setTimeout(() => {
                window.history.back();
            }, 1500);
            
        } catch (error) {
            console.error('Error al guardar:', error);
            this.showNotification('Error al guardar los datos: ' + error.message, 'error');
            this.showLoading(false);
        }
    }

    async saveData() {
        // Sobreescribir en clases hijas
        throw new Error('Método saveData() debe ser implementado en la clase hija');
    }

    getCSRFToken() {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
        return cookieValue || '';
    }

    // Método para cargar datos existentes (para edición)
    loadData(data) {
        Object.keys(data).forEach(key => {
            const field = this.form.querySelector(`[name="${key}"]`) || 
                         this.form.querySelector(`#${key}`);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = data[key];
                } else {
                    field.value = data[key] || '';
                }
                
                // Disparar evento para validación visual
                const event = new Event('input', { bubbles: true });
                field.dispatchEvent(event);
            }
        });
    }
}

// Agregar estilos para notificaciones
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 20px;
    border-radius: 8px;
    background: white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transform: translateX(150%);
    transition: transform 0.3s ease;
    z-index: 10000;
    max-width: 350px;
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
`;
document.head.appendChild(notificationStyles);