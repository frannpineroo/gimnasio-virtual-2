// entidades/static/entrenador/js/pages/formulario_cliente.js
// Versión simplificada que usa la misma estructura que el modal de edición

class FormularioCliente {
    constructor() {
        this.form = document.getElementById('cliente-form');
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.initEventListeners();
        this.initValidation();
    }

    initEventListeners() {
        // Envío del formulario
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Botón cancelar
        const cancelBtn = document.querySelector('.btn-form-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelForm());
        }
    }

    initValidation() {
        // Validación de DNI (solo números)
        const dniInput = document.getElementById('client-dni');
        if (dniInput) {
            dniInput.addEventListener('input', () => {
                dniInput.value = dniInput.value.replace(/[^0-9]/g, '');
            });
        }

        // Validación de teléfono
        const telefonoInput = document.getElementById('client-phone');
        if (telefonoInput) {
            telefonoInput.addEventListener('input', () => {
                telefonoInput.value = telefonoInput.value.replace(/[^0-9+\-\s]/g, '');
            });
        }
    }

    validateForm() {
        const requiredFields = [
            'client-name',
            'client-lastname', 
            'client-dni',
            'client-experience-level',
            'client-goal',
            'client-status'
        ];
        
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                isValid = false;
                this.showFieldError(field, 'Este campo es obligatorio');
            } else {
                this.clearFieldError(field);
            }
        });

        // Validación de email
        const emailInput = document.getElementById('client-email');
        if (emailInput && emailInput.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value.trim())) {
                isValid = false;
                this.showFieldError(emailInput, 'Por favor, ingresa un email válido');
            }
        }

        // Validación de DNI
        const dniInput = document.getElementById('client-dni');
        if (dniInput && dniInput.value.trim()) {
            if (dniInput.value.trim().length < 7 || dniInput.value.trim().length > 20) {
                isValid = false;
                this.showFieldError(dniInput, 'El DNI debe tener entre 7 y 20 caracteres');
            }
        }

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
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Cliente';
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
            
            this.showNotification('Cliente guardado correctamente', 'success');
            
            // SOLUCIÓN: Obtener la URL del enlace "Volver a Clientes"
            setTimeout(() => {
                const backLink = document.querySelector('.form-back-btn');
                if (backLink && backLink.href) {
                    window.location.href = backLink.href;
                } else {
                    // Fallback: usar URL por defecto
                    window.location.href = '/entrenador/clientes/';
                }
            }, 1500);
            
        } catch (error) {
            console.error('Error al guardar:', error);
            this.showNotification('Error al guardar los datos: ' + error.message, 'error');
            this.showLoading(false);
        }
    }

    async saveData() {
        const clientData = {
            name: document.getElementById('client-name').value,
            last_name: document.getElementById('client-lastname').value,
            dni: document.getElementById('client-dni').value || null,
            email: document.getElementById('client-email').value || null,
            phone: document.getElementById('client-phone').value || null,
            experience_level: document.getElementById('client-experience-level').value,
            goal: document.getElementById('client-goal').value || null,
            injuries: document.getElementById('client-injuries').value || null,
            status: document.getElementById('client-status').value
        };
        
        console.log('Guardando cliente:', clientData);
        
        const response = await fetch('/entrenador/api/clientes/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCSRFToken()
            },
            body: JSON.stringify(clientData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error del servidor:', errorData);
            
            // Mostrar errores de validación del servidor
            if (errorData) {
                let errorMessages = [];
                for (const [field, errors] of Object.entries(errorData)) {
                    if (Array.isArray(errors)) {
                        errorMessages.push(`${field}: ${errors.join(', ')}`);
                    } else {
                        errorMessages.push(`${field}: ${errors}`);
                    }
                }
                throw new Error(errorMessages.join('; '));
            }
            
            throw new Error('Error al guardar el cliente');
        }
        
        const savedClient = await response.json();
        console.log('Cliente guardado:', savedClient);
    }

    cancelForm() {
        if (confirm('¿Estás seguro de que deseas cancelar? Los datos no guardados se perderán.')) {
            window.history.back();
        }
    }

    getCSRFToken() {
        // Primero buscar en un input hidden
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        if (csrfToken) {
            return csrfToken.value;
        }
        
        // Fallback: buscar en cookies
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
        return cookieValue || '';
    }
}

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    new FormularioCliente();
});

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
        background: #000000;  /* Fondo negro */
        color: #ffffff;       /* Texto blanco */
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
        color: #ffffff;  /* Texto blanco */
        font-weight: 500;
    }
    `;
    document.head.appendChild(notificationStyles);
}