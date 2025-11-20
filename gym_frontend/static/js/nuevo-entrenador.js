document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('coach-form');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('coach-name').value.trim();
        const lastName = document.getElementById('coach-last_name').value.trim();
        const dni = document.getElementById('coach-dni').value.trim();
        const email = document.getElementById('coach-email').value.trim();
        const phone = document.getElementById('coach-phone').value.trim();
        const speciality = document.getElementById('coach-speciality').value.trim();
        const certification = document.getElementById('coach-certification').value.trim();
        const yearsOfExp = document.getElementById('coach-years_of_exp').value.trim();
        const status = document.getElementById('coach-status').value;
        const hiringDate = document.getElementById('coach-hiring_date').value.trim();

        // Validación mejorada
        if (!name || !lastName || !dni || !email || !phone || !speciality || !certification || !yearsOfExp || !status || !hiringDate) {
            alert('Por favor completa los campos requeridos (*)');
            return;
        }

        // Verificar que status no esté vacío
        if (status === "" || status === null || status === undefined) {
            alert('Por favor selecciona un estado válido');
            console.error('Estado inválido:', status);
            return;
        }

        const coachData = {
            name: name,
            last_name: lastName,
            dni: dni,
            email: email,
            phone: phone,
            speciality: speciality,
            certification: certification,
            years_of_exp: yearsOfExp,
            status: status,
            hiring_date: hiringDate
        };

        fetch('http://localhost:8000/api/entrenadores/', {
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
            
            alert('Entrenador guardado exitosamente!');
            window.location.href = 'entrenador.html';
        })
        .catch(error => {
            alert('Ocurrió un problema al guardar el entrenador: ' + error.message);
        });
    });
});