// entidades/static/entrenador/js/pages/formulario_cliente.js
class FormularioCliente extends FormularioBase {
    constructor() {
        super('cliente-form');
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

        // Validación de fecha de nacimiento (debe ser pasada)
        const fechaNacimientoInput = document.getElementById('fecha_nacimiento');
        if (fechaNacimientoInput) {
            const today = new Date().toISOString().split('T')[0];
            fechaNacimientoInput.max = today;
            
            fechaNacimientoInput.addEventListener('blur', () => {
                if (fechaNacimientoInput.value) {
                    const birthDate = new Date(fechaNacimientoInput.value);
                    const todayDate = new Date();
                    const age = todayDate.getFullYear() - birthDate.getFullYear();
                    
                    if (age < 16) {
                        this.setFieldValidation(
                            fechaNacimientoInput, 
                            false, 
                            'El cliente debe tener al menos 16 años'
                        );
                    }
                }
            });
        }

        // Validación de email único (simulada)
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', async () => {
                if (emailInput.value.trim()) {
                    // Aquí podrías verificar si el email ya existe en la BD
                    // Por ahora solo simulamos una validación
                    await this.checkEmailExists(emailInput.value.trim());
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

        if (field.id === 'fecha_nacimiento' && field.value) {
            const birthDate = new Date(field.value);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            
            // Ajustar si aún no ha cumplido años este año
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            if (age < 16) {
                this.setFieldValidation(field, false, 'El cliente debe tener al menos 16 años');
                return false;
            }
            
            if (age > 100) {
                this.setFieldValidation(field, false, 'Por favor, verifica la fecha de nacimiento');
                return false;
            }
        }

        if (field.id === 'objetivos' && field.value.trim()) {
            if (field.value.trim().length < 5) {
                this.setFieldValidation(field, false, 'Los objetivos deben tener al menos 5 caracteres');
                return false;
            }
        }

        return true;
    }

    async checkEmailExists(email) {
        // Simulación de verificación de email
        // En producción, harías una llamada a la API
        return new Promise(resolve => {
            setTimeout(() => {
                // Ejemplo: supongamos que "existente@email.com" ya existe
                if (email === 'existente@email.com') {
                    this.setFieldValidation(
                        document.getElementById('email'),
                        false,
                        'Este email ya está registrado'
                    );
                    resolve(false);
                } else {
                    resolve(true);
                }
            }, 500);
        });
    }

    async saveData() {
        // Recolectar datos del formulario
        const formData = {
            nombre: document.getElementById('nombre').value,
            apellido: document.getElementById('apellido').value,
            dni: document.getElementById('dni').value,
            telefono: document.getElementById('telefono').value,
            email: document.getElementById('email').value,
            direccion: document.getElementById('direccion').value || '',
            fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
            genero: document.getElementById('genero').value || '',
            objetivos: document.getElementById('objetivos').value || '',
            observaciones: document.getElementById('observaciones').value || '',
            activo: document.getElementById('activo').checked
        };

        console.log('Guardando cliente:', formData);
        
        // TODO: Reemplazar con llamada real a la API
        // const response = await fetch('/entrenador/api/clientes/', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'X-CSRFToken': this.getCSRFToken()
        //     },
        //     body: JSON.stringify(formData)
        // });
        
        // if (!response.ok) {
        //     throw new Error('Error al guardar el cliente');
        // }
        
        // Simulación de delay
        await new Promise(resolve => setTimeout(resolve, 1500));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FormularioCliente();
});