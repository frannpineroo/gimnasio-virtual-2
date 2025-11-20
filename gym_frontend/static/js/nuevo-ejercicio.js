document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('exercise-form');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('exercise-name').value.trim();
        const muscleGroup = document.getElementById('muscle-group').value;
        const description = document.getElementById('exercise-description').value.trim();

        // Validación mejorada
        if (!name || !muscleGroup) {
            alert('Por favor completa los campos requeridos (*)');
            return;
        }

        // Verificar que muscle_group no esté vacío
        if (muscleGroup === "" || muscleGroup === null || muscleGroup === undefined) {
            alert('Por favor selecciona un grupo muscular válido');
            console.error('Grupo muscular inválido:', muscleGroup);
            return;
        }

        const exerciseData = {
            name: name,
            muscle_group: muscleGroup,
            description: description || ""
        };

        fetch('http://localhost:8000/api/ejercicios/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(exerciseData)
        })
        .then(response => {
            
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Error ${response.status}: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            
            alert('Ejercicio guardado exitosamente!');
            window.location.href = '/entrenador/ejercicios/';
        })
        .catch(error => {
            alert('Ocurrió un problema al guardar el ejercicio: ' + error.message);
        });
    });
});