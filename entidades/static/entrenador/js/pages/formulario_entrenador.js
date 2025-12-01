// entidades/static/entrenador/js/pages/formulario_entrenador.js
class FormularioEntrenador extends FormularioBase {
    constructor() {
        super('entrenador-form');
    }

    initValidation() {
        // Validación de DNI
        const dniInput = document.getElementById('dni');
        if (dniInput) {
            dniInput.addEventListener('input', () => {
                dniInput.value = dniInput.value.replace(/[^0-9]/g, '');
            });
        }

        // Validación de teléfono
        const telefonoInput = document.getElementById('telefono');
        if (telefonoInput) {
            telefonoInput.addEventListener('input', () => {
                telefonoInput.value = telefonoInput.value.replace(/[^0-9+\-\s]/g, '');
            });
        }

        // Validación de sueldo (debe ser positivo)
        const sueldoInput = document.getElementById('sueldo');
        if (sueldoInput) {
            sueldoInput.addEventListener('blur', () => {
                if (sueldoInput.value && parseFloat(sueldoInput.value) < 0) {
                    this.setFieldValidation(sueldoInput, false, 'El sueldo no puede ser negativo');
                }
            });
        }

        // Validación de experiencia (no puede ser negativa)
        const experienciaInput = document.getElementById('experiencia');
        if (experienciaInput) {
            experienciaInput.addEventListener('blur', () => {
                if (experienciaInput.value && parseInt(experienciaInput.value) < 0) {
                    this.setFieldValidation(experienciaInput, false, 'La experiencia no puede ser negativa');
                }
            });
        }
    }

    validateField(field) {
        const isValid = super.validateField(field);
        
        if (!isValid) return false;

        if (field.id === 'dni' && field.value.trim()) {
            if (field.value.length < 7 || field.value.length > 9) {
                this.setFieldValidation(field, false, 'El DNI debe tener entre 7 y 9 dígitos');
                return false;
            }
        }

        if (field.id === 'sueldo' && field.value.trim()) {
            const sueldo = parseFloat(field.value);
            if (isNaN(sueldo) || sueldo < 0) {
                this.setFieldValidation(field, false, 'Ingrese un sueldo válido (número positivo)');
                return false;
            }
        }

        if (field.id === 'experiencia' && field.value.trim()) {
            const experiencia = parseInt(field.value);
            if (isNaN(experiencia) || experiencia < 0) {
                this.setFieldValidation(field, false, 'Ingrese una experiencia válida (número positivo)');
                return false;
            }
            if (experiencia > 50) {
                this.setFieldValidation(field, false, 'La experiencia no puede ser mayor a 50 años');
                return false;
            }
        }

        return true;
    }

    async saveData() {
        // Recolectar datos del formulario
        const formData = {
            nombre: document.getElementById('nombre').value,
            apellido: document.getElementById('apellido').value,
            dni: document.getElementById('dni').value,
            telefono: document.getElementById('telefono').value,
            email: document.getElementById('email').value,
            especialidad: document.getElementById('especialidad').value,
            fecha_contratacion: document.getElementById('fecha_contratacion').value,
            sueldo: document.getElementById('sueldo').value || null,
            certificaciones: document.getElementById('certificaciones').value,
            experiencia: document.getElementById('experiencia').value || null,
            activo: document.getElementById('activo').checked
        };

        console.log('Guardando entrenador:', formData);
        
        // TODO: Reemplazar con llamada real a la API
        // const response = await fetch('/entrenador/api/entrenadores/', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'X-CSRFToken': this.getCSRFToken()
        //     },
        //     body: JSON.stringify(formData)
        // });
        
        // if (!response.ok) {
        //     throw new Error('Error al guardar el entrenador');
        // }
        
        // Simulación de delay
        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    getCSRFToken() {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
        return cookieValue || '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FormularioEntrenador();
});