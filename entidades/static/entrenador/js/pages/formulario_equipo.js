// entidades/static/entrenador/js/pages/formulario_equipo.js
class FormularioEquipo extends FormularioBase {
    constructor() {
        super('equipo-form');
    }

    initValidation() {
        // Validación de valor (debe ser positivo si se ingresa)
        const valorInput = document.getElementById('valor');
        if (valorInput) {
            valorInput.addEventListener('blur', () => {
                if (valorInput.value && parseFloat(valorInput.value) < 0) {
                    this.setFieldValidation(valorInput, false, 'El valor no puede ser negativo');
                }
            });
        }

        // Validación de fecha de adquisición (no puede ser futura)
        const fechaAdquisicionInput = document.getElementById('fecha_adquisicion');
        if (fechaAdquisicionInput) {
            const today = new Date().toISOString().split('T')[0];
            fechaAdquisicionInput.max = today;
        }

        // Validación de descripción mínima
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

    validateField(field) {
        const isValid = super.validateField(field);
        
        if (!isValid) return false;

        if (field.id === 'valor' && field.value.trim()) {
            const valor = parseFloat(field.value);
            if (isNaN(valor) || valor < 0) {
                this.setFieldValidation(field, false, 'Ingrese un valor válido (número positivo)');
                return false;
            }
        }

        if (field.id === 'fecha_adquisicion' && field.value.trim()) {
            const hoy = new Date().toISOString().split('T')[0];
            if (field.value > hoy) {
                this.setFieldValidation(field, false, 'La fecha de adquisición no puede ser futura');
                return false;
            }
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
            categoria: document.getElementById('categoria').value,
            modelo: document.getElementById('modelo').value,
            marca: document.getElementById('marca').value || '',
            descripcion: document.getElementById('descripcion').value,
            numero_serie: document.getElementById('numero_serie').value || '',
            fecha_adquisicion: document.getElementById('fecha_adquisicion').value,
            estado: document.getElementById('estado').value,
            condicion: document.getElementById('condicion').value,
            ubicacion: document.getElementById('ubicacion').value || '',
            valor: document.getElementById('valor').value || null,
            notas: document.getElementById('notas').value || ''
        };

        console.log('Guardando equipo:', formData);
        
        // TODO: Reemplazar con llamada real a la API
        // const response = await fetch('/entrenador/api/equipos/', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'X-CSRFToken': this.getCSRFToken()
        //     },
        //     body: JSON.stringify(formData)
        // });
        
        // if (!response.ok) {
        //     throw new Error('Error al guardar el equipo');
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
    new FormularioEquipo();
});