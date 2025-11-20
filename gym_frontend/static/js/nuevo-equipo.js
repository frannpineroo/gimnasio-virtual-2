document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('equipment-form');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('equipment-name').value.trim();
        const description = document.getElementById('equipment-description').value.trim();
        const category = document.getElementById('category').value.trim();
        const model = document.getElementById('model').value.trim();
        const status = document.getElementById('status').value;
        const condition = document.getElementById('condition').value;

        // Validación mejorada
        if (!name || !description || !category || !model || !status || !condition) {
            alert('Por favor completa los campos requeridos (*)');
            return;
        }

        // Verificar que status no esté vacío
        if (status === "" || status === null || status === undefined) {
            alert('Por favor selecciona un estado válido');
            console.error('Estado inválido:', status);
            return;
        }

        // Verificar que condition no esté vacío
        if (condition === "" || condition === null || condition === undefined) {
            alert('Por favor selecciona una condición válida');
            console.error('Condición inválida:', condition);
            return;
        }

        const coachData = {
            name: name,
            description: description || "",
            category: category,
            model: model,
            status: status,
            condition: condition
        };

        fetch('http://localhost:8000/api/equipos/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(coachData)
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
            
            alert('Equipo guardado exitosamente!');
            window.location.href = 'nuevo-equipo.html';
        })
        .catch(error => {
            alert('Ocurrió un problema al guardar al entrenador: ' + error.message);
        });
    });
});