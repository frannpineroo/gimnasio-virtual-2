// LÓGICA ESPECÍFICA PARA LA PÁGINA DE RUTINAS

// Variables globales
let currentRoutineId = null;
let allRoutines = [];

// Función para capitalizar la primera letra
function capitalizeFirstLetter(string) {
    if (!string || typeof string !== 'string') {
        return '-'; // Devolver guión si es null/undefined
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Función para formatear fecha
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}

document.addEventListener('DOMContentLoaded', function () {
    getRutinas();

    const confirmDelete = document.getElementById('confirm-delete');
    if (confirmDelete) {
        confirmDelete.addEventListener('click', function () {
            if (currentRoutineId) {
                deleteExercise(currentRoutineId);
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

// GET: Obtener todas las rutinas
function getRutinas() {
    fetch('http://localhost:8000/api/rutinas/') 
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                console.log('Primera rutina:', data[0]);
            }
            allRoutines = data;
            renderRutinasTable(allRoutines);
        })
        .catch(error => {
            console.error('Error al cargar rutinas:', error);
        });
}

// POST: Crear una nueva rutina
function createRutina(rutinaData) {
    console.log("Datos enviados:", rutinaData);
    fetch('http://localhost:8000/api/rutinas/', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(rutinaData)
    })
    .then(response => {
        console.log("Status:", response.status);
        if (!response.ok) {
            return response.text().then(text => {  
                console.log("Error response:", text);
                throw new Error('No se pudo crear la rutina');
            });
        }
        return response.json();
    })
    .then(data => {
        getRutinas();
    })
    .catch(error => {
        console.error('Error al crear rutina:', error);
    });
}

// PUT: Actualizar una rutina existente
function updateRutina(id, rutinaData) {
    fetch(`http://localhost:8000/api/rutinas/${id}/`, {  
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(rutinaData)
    })
    .then(response => {
        if (!response.ok) throw new Error('No se pudo actualizar la rutina');
        return response.json();
    })
    .then(data => {
        getRutinas();
    })
    .catch(error => {
        console.error('Error al actualizar rutina:', error);
    });
}

// DELETE: Eliminar una rutina
function deleteRutina(id) {
    fetch(`http://localhost:8000/api/rutinas/${id}/`, {  
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) throw new Error('No se pudo eliminar la rutina');
        closeModals();
        getRutinas();
    })
    .catch(error => {
        console.error('Error al eliminar rutina:', error);
    });
}

function renderRutinasTable(rutinas) {
    const tbody = document.getElementById('routines-table-body');

    if (!rutinas.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 30px;">
                    <i class="fas fa-clipboard-list" style="font-size: 48px; color: #32CD32; margin-bottom: 15px;"></i>
                    <h3>No hay rutinas registradas</h3>
                    <p>Comienza creando tu primera rutina</p>
                    <a href="nueva-rutina.html" class="btn btn-white" style="margin-top: 15px;">
                        <i class="fas fa-plus"></i> Crear primera rutina
                    </a>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = rutinas.map(rutina => `
        <tr>
            <td>
                <div class="routine-info">
                    <h4>${rutina.name || '-'}</h4>
                </div>
            </td>
            <td>${rutina.description || '-'}</td>
            <td>${rutina.client_name || 'Cliente'}</td>
            <td>${rutina.time_week || '-'} semanas</td>
            <td>${rutina.days_per_week || '-'} semanas</td>
            <td>${formatDate(rutina.created_at)}</td>
            <td>${rutina.coach_name || 'Profesor'}</td>
            <td class="actions-cell">
                <button class="action-btn view-btn" data-id="${rutina.id}" title="Ver rutina">
                    <i class="fas fa-eye"></i>
                </button>
                <a href="nueva-rutina.html?id=${rutina.id}" class="action-btn edit-btn" title="Editar rutina">
                    <i class="fas fa-pen"></i>
                </a>
                <button class="action-btn delete-btn" data-id="${rutina.id}" title="Eliminar rutina">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Event listeners para botones de eliminar
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            currentRoutineId = parseInt(this.dataset.id);
            showDeleteModal();
        });
    });

    // Event listeners para botones de ver
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const routineId = parseInt(this.dataset.id);
            viewRutina(routineId);
        });
    });
}

function filterRutinas(searchTerm) {
    const term = searchTerm.toLowerCase();
    const filtered = allRoutines.filter(rutina =>
        (rutina.name && rutina.name.toLowerCase().includes(term)) ||
        (rutina.description && rutina.description.toLowerCase().includes(term)) ||
        (rutina.coach_name && rutina.coach_name.toLowerCase().includes(term))
    );
    renderRutinasTable(filtered);
}

// Ver detalles de una rutina
function viewRutina(routineId) {
    fetch(`http://localhost:8000/api/rutinas/${routineId}/`)
        .then(response => response.json())
        .then(data => {
            console.log('Detalle de rutina:', data);
            showViewModal(data);
        })
        .catch(error => {
            console.error('Error al cargar detalle de rutina:', error);
        });
}

// Mostrar modal con detalle de rutina
function showViewModal(rutina) {
    let modal = document.getElementById('view-routine-modal');

    // Si no existe, lo creamos dinámicamente (útil para evitar fallos si no tienes HTML)
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'view-routine-modal';
        modal.className = 'modal active'; // asume estilos .modal y .active en CSS
        modal.innerHTML = `
            <div class="modal-content view-modal-content">
                <button class="modal-close" id="view-modal-close" aria-label="Cerrar">&times;</button>
                <h2 id="view-routine-title">Rutina</h2>
                <div id="view-routine-body"></div>
            </div>
        `;
        document.body.appendChild(modal);

        // listener para cerrar
        document.getElementById('view-modal-close').addEventListener('click', closeViewModal);
        // cerrar al click fuera del contenido
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeViewModal();
        });
    } else {
        // Aseguramos que esté visible
        modal.classList.add('active');
    }

    // Rellenar contenido con los datos de la rutina de forma segura
    const titleEl = document.getElementById('view-routine-title');
    const bodyEl = document.getElementById('view-routine-body');

    titleEl.textContent = rutina.name || 'Rutina sin nombre';

    // Construimos un HTML descriptivo (ajusta según estructura de tu API)
    const createdAt = rutina.created_at ? new Date(rutina.created_at).toLocaleString('es-ES') : '-';
    const clientName = rutina.client_name || (rutina.client ? `${rutina.client.nombre || ''} ${rutina.client.apellido || ''}` : '-');
    const coachName  = rutina.coach_name  || (rutina.professor ? `${rutina.professor.nombre || ''} ${rutina.professor.apellido || ''}` : '-');

    let html = `
        <p><strong>Descripción:</strong> ${rutina.description || '-'}</p>
        <p><strong>Cliente:</strong> ${clientName}</p>
        <p><strong>Profesor:</strong> ${coachName}</p>
        <p><strong>Duración:</strong> ${rutina.time_week || '-'} semanas</p>
        <p><strong>Días por semana:</strong> ${rutina.days_per_week || '-'}</p>
        <p><strong>Creada:</strong> ${createdAt}</p>
    `;

    // Si tu objeto trae ejercicios, los listamos
    if (Array.isArray(rutina.exercises) && rutina.exercises.length > 0) {
        html += '<h4>Ejercicios</h4><ul>';
        rutina.exercises.forEach(ex => {
            const exName = ex.name || ex.exercise_name || 'Ejercicio';
            const sets = ex.sets ? ` - ${ex.sets} series` : '';
            const reps = ex.reps ? ` - ${ex.reps} reps` : '';
            html += `<li>${exName}${sets}${reps}${ex.notes ? ` (<em>${ex.notes}</em>)` : ''}</li>`;
        });
        html += '</ul>';
    } else {
        html += '<p><em>No hay ejercicios asociados</em></p>';
    }

    bodyEl.innerHTML = html;
}

// Cerrar modal de vista
function closeViewModal() {
    const modal = document.getElementById('view-routine-modal');
    if (modal) modal.classList.remove('active');
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