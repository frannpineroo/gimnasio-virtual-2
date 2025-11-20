// LÓGICA ESPECÍFICA PARA LA PÁGINA DE ENTRENADORES

// Variables globales
let currentCoachId = null;
let allCoachs = [];

// Función para capitalizar la primera letra 
function capitalizeFirstLetter(string) {
    if (!string || typeof string !== 'string') {
        return '-'; 
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
}

document.addEventListener('DOMContentLoaded', function () {
    getCoachs();

    const confirmDelete = document.getElementById('confirm-delete');
    if (confirmDelete) {
        confirmDelete.addEventListener('click', function () {
            if (currentCoachId) {
                deleteCoach(currentCoachId);
            }
        });
    } else {
        console.warn("Elemento #confirm-delete no encontrado en el DOM.");
    }

    const cancelDelete = document.getElementById('cancel-delete');
    if (cancelDelete) {
        cancelDelete.addEventListener('click', closeModals);
    } else {
        console.warn("Elemento #cancel-delete no encontrado en el DOM.");
    }
});

// GET: Obtener todos los entrenadores
function getCoachs() {
    fetch('http://localhost:8000/api/entrenadores/')
        .then(response => {
            if (!response.ok) throw new Error('Respuesta no OK: ' + response.status);
            return response.json();
        })
        .then(data => {
            allCoachs = Array.isArray(data) ? data : [];
            renderCoachsTable(allCoachs);
        })
        .catch(error => {
            // opcional: render vacío
            renderCoachsTable([]);
        });
}

// POST: Crear un nuevo entrenador
function createCoach(coachData) {
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
                console.log("Error response:", text);
                throw new Error('No se pudo crear el entrenador');
            });
        }
        return response.json();
    })
    .then(data => {
        getCoachs();
    })
    .catch(error => {
        console.error('Error al crear entrenador:', error);
    });
}

// PUT: Actualizar un entrenador existente
function updateCoach(id, coachData) {
    fetch(`http://localhost:8000/api/entrenadores/${id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(coachData)
    })
    .then(response => {
        if (!response.ok) throw new Error('No se pudo actualizar el entrenador');
        return response.json();
    })
    .then(data => {
        getCoachs();
    })
    .catch(error => {
        console.error('Error al actualizar entrenador:', error);
    });
}

// DELETE: Eliminar un entrenador
function deleteCoach(id) {
    fetch(`http://localhost:8000/api/entrenadores/${id}/`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) throw new Error('No se pudo eliminar el entrenador');
        closeModals();
        getCoachs();
    })
    .catch(error => {
        console.error('Error al eliminar entrenador:', error);
    });
}

function renderCoachsTable(coachs) {
    const tbody = document.getElementById('coaches-table-body');
    if (!tbody) {
        console.warn("Elemento #coaches-table-body no encontrado en el DOM.");
        return;
    }

    if (!Array.isArray(coachs) || coachs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 30px;">
                    <i class="fas fa-dumbbell" style="font-size: 48px; color: #32CD32; margin-bottom: 15px;"></i>
                    <h3>No hay entrenadores registrados</h3>
                    <p>Comienza agregando tu primer entrenador</p>
                    <a href="nuevo-entrenador.html" class="btn btn-white" style="margin-top: 15px;">
                        <i class="fas fa-plus"></i> Agregar primer entrenador
                    </a>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = coachs.map(coach => `
        <tr>
            <td>${coach.name || '-'}</td>
            <td>${coach.last_name || '-'}</td>
            <td>${coach.dni || '-'}</td>
            <td>${coach.email || '-'}</td>
            <td>${coach.phone || '-'}</td>
            <td>${coach.speciality || '-'}</td>
            <td>${capitalizeFirstLetter(coach.status)}</td>
                <a href="nuevo-entrenador.html?id=${coach.id}" class="action-btn edit-btn" title="Editar entrenador">
                    <i class="fas fa-pen"></i>
                </a>
                <button class="action-btn delete-btn" data-id="${coach.id}" title="Eliminar entrenador">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    const deleteBtns = document.querySelectorAll('.delete-btn');
    if (deleteBtns && deleteBtns.length) {
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                currentCoachId = parseInt(this.dataset.id);
                showDeleteModal();
            });
        });
    }
}

function filterCoachs(searchTerm) {
    const term = (searchTerm || '').toLowerCase();
    const filtered = allCoachs.filter(e =>
        (e.name && e.name.toLowerCase().includes(term)) ||
        (e.muscle_group && e.muscle_group.toLowerCase().includes(term)) ||
        (e.equipment && e.equipment.toLowerCase().includes(term)) ||
        (e.description && e.description.toLowerCase().includes(term))
    );
    renderCoachsTable(filtered);
}

function showDeleteModal() {
    const modal = document.getElementById('delete-modal');
    if (!modal) {
        console.warn("Elemento #delete-modal no encontrado.");
        return;
    }
    modal.classList.add('active');
}

function closeModals() {
    const modal = document.getElementById('delete-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}
