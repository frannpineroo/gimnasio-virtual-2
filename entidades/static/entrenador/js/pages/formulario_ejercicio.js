// entidades/static/entrenador/js/pages/formulario_ejercicio.js
class FormularioEjercicio extends FormularioBase {
    constructor() {
        super('ejercicio-form');
    }

    initValidation() {
        // Validar que si se proporciona URL de imagen, sea válida
        const imagenInput = document.getElementById('imagen_url');
        if (imagenInput) {
            imagenInput.addEventListener('blur', () => {
                if (imagenInput.value.trim()) {
                    this.validateUrl(imagenInput);
                }
            });
        }

        // Validar que si se proporciona URL de video, sea válida
        const videoInput = document.getElementById('video_url');
        if (videoInput) {
            videoInput.addEventListener('blur', () => {
                if (videoInput.value.trim()) {
                    this.validateUrl(videoInput);
                }
            });
        }

        // Validar descripción mínima
        const descripcionInput = document.getElementById('descripcion');
        if (descripcionInput) {
            descripcionInput.addEventListener('blur', () => {
                if (descripcionInput.value.trim().length < 10) {
                    this.setFieldValidation(
                        descripcionInput, 
                        false, 
                        'La descripción debe tener al menos 10 caracteres'
                    );
                }
            });
        }
    }

    validateUrl(field) {
        try {
            new URL(field.value);
            return true;
        } catch {
            this.setFieldValidation(field, false, 'Por favor, ingresa una URL válida');
            return false;
        }
    }

    validateField(field) {
        const isValid = super.validateField(field);
        
        if (!isValid) return false;

        // Validaciones específicas para ejercicio
        if (field.id === 'imagen_url' && field.value.trim()) {
            return this.validateUrl(field);
        }

        if (field.id === 'video_url' && field.value.trim()) {
            return this.validateUrl(field);
        }

        if (field.id === 'descripcion' && field.value.trim()) {
            if (field.value.trim().length < 10) {
                this.setFieldValidation(
                    field, 
                    false, 
                    'La descripción debe tener al menos 10 caracteres'
                );
                return false;
            }
        }

        return true;
    }

    async saveData() {
        // Recolectar datos del formulario
        const formData = {
            nombre: document.getElementById('nombre').value,
            grupo_muscular: document.getElementById('grupo_muscular').value,
            dificultad: document.getElementById('dificultad').value,
            equipo_requerido: document.getElementById('equipo_requerido').value,
            descripcion: document.getElementById('descripcion').value,
            instrucciones: document.getElementById('instrucciones').value,
            imagen_url: document.getElementById('imagen_url').value,
            video_url: document.getElementById('video_url').value,
            activo: document.getElementById('activo').checked
        };

        console.log('Guardando ejercicio:', formData);
        
        // TODO: Reemplazar con llamada real a la API
        // const response = await fetch('/entrenador/api/ejercicios/', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'X-CSRFToken': this.getCSRFToken()
        //     },
        //     body: JSON.stringify(formData)
        // });
        
        // if (!response.ok) {
        //     throw new Error('Error al guardar el ejercicio');
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
    new FormularioEjercicio();
});