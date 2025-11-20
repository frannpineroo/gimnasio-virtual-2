// LÓGICA ESPECÍFICA PARA LA PÁGINA DE EJERCICIOS (versión defensiva)

// Variables globales
let currentEquipmentId = null;
let allEquipments = [];

// Función para capitalizar la primera letra 
function capitalizeFirstLetter(string) {
    if (!string || typeof string !== 'string') {
        return '-'; 
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
}

document.addEventListener('DOMContentLoaded', function () {
    getEquipments();

    const confirmDelete = document.getElementById('confirm-delete');
    if (confirmDelete) {
        confirmDelete.addEventListener('click', function () {
            if (currentEquipmentId) {
                deleteEquipment(currentEquipmentId);
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

// GET: Obtener todos los equipos
function getEquipments() {
    fetch('http://localhost:8000/api/equipos/')
        .then(response => {
            if (!response.ok) throw new Error('Respuesta no OK: ' + response.status);
            return response.json();
        })
        .then(data => {
            allEquipments = Array.isArray(data) ? data : [];
            renderEquipmentTable(allEquipments);
        })
        .catch(error => {
            // opcional: render vacío
            renderEquipmentTable([]);
        });
}

// POST: Crear un nuevo ejercicio
function createEquipment(equipmentData) {
    fetch('http://localhost:8000/api/equipos/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(equipmentData)
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                console.log("Error response:", text);
                throw new Error('No se pudo crear el equipo');
            });
        }
        return response.json();
    })
    .then(data => {
        getEquipments();
    })
    .catch(error => {
        console.error('Error al crear equipo:', error);
    });
}

// PUT: Actualizar un equipo existente
function updateExercise(id, equipmentData) {
    fetch(`http://localhost:8000/api/equipos/${id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(equipmentData)
    })
    .then(response => {
        if (!response.ok) throw new Error('No se pudo actualizar el equipo');
        return response.json();
    })
    .then(data => {
        getEquipments();
    })
    .catch(error => {
        console.error('Error al actualizar equipo:', error);
    });
}

// DELETE: Eliminar un equipo
function deleteEquipment(id) {
    fetch(`http://localhost:8000/api/equipos/${id}/`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) throw new Error('No se pudo eliminar el equipo');
        closeModals();
        getEquipments();
    })
    .catch(error => {
        console.error('Error al eliminar equipo:', error);
    });
}

function renderEquipmentTable(equipments) {
    const tbody = document.getElementById('equipment-table-body');
    if (!tbody) {
        console.warn("Elemento #equipment-table-body no encontrado en el DOM.");
        return;
    }

    if (!Array.isArray(equipments) || equipments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 30px;">
                    <i class="fas fa-dumbbell" style="font-size: 48px; color: #32CD32; margin-bottom: 15px;"></i>
                    <h3>No hay equipos registrados</h3>
                    <p>Comienza agregando tu primer equipo</p>
                    <a href="nuevo-equipo.html" class="btn btn-white" style="margin-top: 15px;">
                        <i class="fas fa-plus"></i> Agregar primer equipo
                    </a>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = equipments.map(equipment => `
        <tr>
            <td>${equipment.name}</td>
            <td>${equipment.description || '-'}</td>
            <td>${equipment.category}</td>
            <td>${equipment.model}</td>
            <td>${equipment.status}</td>
            <td>${equipment.condition || '-'}</td>
            <td class="actions-cell">
                <a href="nuevo-equipo.html?id=${equipment.id}" class="action-btn edit-btn" title="Editar equipo">
                    <i class="fas fa-pen"></i>
                </a>
                <button class="action-btn delete-btn" data-id="${equipment.id}" title="Eliminar equipo">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    const deleteBtns = document.querySelectorAll('.delete-btn');
    if (deleteBtns && deleteBtns.length) {
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                currentEquipmentId = parseInt(this.dataset.id);
                showDeleteModal();
            });
        });
    }
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
