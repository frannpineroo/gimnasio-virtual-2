// LÓGICA ESPECÍFICA PARA LA PÁGINA DE EJERCICIOS

// Variables globales
let currentExerciseId = null;
let allExercises = [];
let currentFilters = {
    search: '',
    muscleGroup: ''
};

// Función para capitalizar la primera letra 
function capitalizeFirstLetter(string) {
    if (!string || typeof string !== 'string') {
        return '-'; 
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
}

document.addEventListener('DOMContentLoaded', function () {
    getExercises();

    // Eventos para modal de eliminar
    const confirmDelete = document.getElementById('confirm-delete');
    if (confirmDelete) {
        confirmDelete.addEventListener('click', function () {
            if (currentExerciseId) {
                deleteExercise(currentExerciseId);
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

    // Eventos para modal de editar
    const closeEditModal = document.getElementById('close-edit-modal');
    if (closeEditModal) {
        closeEditModal.addEventListener('click', function() {
            document.getElementById('edit-modal').classList.remove('active');
        });
    }

    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', function() {
            document.getElementById('edit-modal').classList.remove('active');
        });
    }

    // Formulario de edición
    const editForm = document.getElementById('edit-exercise-form');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleEditSubmit();
        });
    }

    // Cerrar modal al hacer clic fuera del contenido
    const editModal = document.getElementById('edit-modal');
    if (editModal) {
        editModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    }

    // ========== FILTROS ==========
    
    // Filtro por nombre (búsqueda)
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            currentFilters.search = e.target.value.toLowerCase();
            applyFilters();
            updateActiveFiltersDisplay();
        });
    }

    // Filtro por grupo muscular
    const muscleGroupFilter = document.getElementById('muscle-group-filter');
    if (muscleGroupFilter) {
        muscleGroupFilter.addEventListener('change', function(e) {
            currentFilters.muscleGroup = e.target.value;
            applyFilters();
            updateActiveFiltersDisplay();
        });
    }

    // Botón resetear filtros
    const resetFilters = document.getElementById('reset-filters');
    if (resetFilters) {
        resetFilters.addEventListener('click', function() {
            resetAllFilters();
        });
    }
});

// GET: Obtener todos los ejercicios
function getExercises() {
    fetch('http://localhost:8000/api/ejercicios/')
        .then(response => {
            if (!response.ok) throw new Error('Respuesta no OK: ' + response.status);
            return response.json();
        })
        .then(data => {
            allExercises = Array.isArray(data) ? data : [];
            applyFilters(); // Aplicar filtros actuales después de cargar
        })
        .catch(error => {
            console.error('Error al obtener ejercicios:', error);
            allExercises = [];
            renderExercisesTable([]);
            showNotification('Error al cargar los ejercicios', 'error');
        });
}

// Aplicar todos los filtros
function applyFilters() {
    let filteredExercises = allExercises;

    // Filtro por búsqueda
    if (currentFilters.search) {
        filteredExercises = filteredExercises.filter(exercise => 
            exercise.name.toLowerCase().includes(currentFilters.search) ||
            (exercise.description && exercise.description.toLowerCase().includes(currentFilters.search))
        );
    }

    // Filtro por grupo muscular
    if (currentFilters.muscleGroup) {
        filteredExercises = filteredExercises.filter(exercise => 
            exercise.muscle_group === currentFilters.muscleGroup
        );
    }

    renderExercisesTable(filteredExercises);
}

// Resetear todos los filtros
function resetAllFilters() {
    currentFilters = {
        search: '',
        muscleGroup: ''
    };
    
    // Resetear valores de los inputs
    const searchInput = document.getElementById('search-input');
    const muscleGroupFilter = document.getElementById('muscle-group-filter');
    
    if (searchInput) searchInput.value = '';
    if (muscleGroupFilter) muscleGroupFilter.value = '';
    
    applyFilters();
    updateActiveFiltersDisplay();
    showNotification('Filtros reseteados', 'info');
}

// Actualizar display de filtros activos
function updateActiveFiltersDisplay() {
    const filtersActiveElement = document.getElementById('filters-active');
    
    // Crear elemento si no existe
    if (!filtersActiveElement) {
        const filtersSection = document.querySelector('.filters-section');
        if (filtersSection) {
            const filtersActiveHTML = `
                <div id="filters-active" class="filters-active hidden">
                    <span>Filtros activos:</span>
                    <div id="active-filters-list"></div>
                </div>
            `;
            filtersSection.insertAdjacentHTML('beforeend', filtersActiveHTML);
        }
    }
    
    const activeFiltersList = document.getElementById('active-filters-list');
    const filtersActive = document.getElementById('filters-active');
    
    if (!activeFiltersList || !filtersActive) return;
    
    activeFiltersList.innerHTML = '';
    
    const activeFilters = [];
    
    // Filtro de búsqueda
    if (currentFilters.search) {
        activeFilters.push(`
            <div class="filter-tag">
                Búsqueda: "${currentFilters.search}"
                <button onclick="removeSearchFilter()" title="Quitar filtro de búsqueda">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `);
    }
    
    // Filtro de grupo muscular
    if (currentFilters.muscleGroup) {
        const muscleGroupName = capitalizeFirstLetter(currentFilters.muscleGroup);
        activeFilters.push(`
            <div class="filter-tag">
                Grupo: ${muscleGroupName}
                <button onclick="removeMuscleGroupFilter()" title="Quitar filtro de grupo muscular">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `);
    }
    
    if (activeFilters.length > 0) {
        activeFiltersList.innerHTML = activeFilters.join('');
        filtersActive.classList.remove('hidden');
    } else {
        filtersActive.classList.add('hidden');
    }
}

// Remover filtro de búsqueda
function removeSearchFilter() {
    currentFilters.search = '';
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    applyFilters();
    updateActiveFiltersDisplay();
}

// Remover filtro de grupo muscular
function removeMuscleGroupFilter() {
    currentFilters.muscleGroup = '';
    const muscleGroupFilter = document.getElementById('muscle-group-filter');
    if (muscleGroupFilter) muscleGroupFilter.value = '';
    applyFilters();
    updateActiveFiltersDisplay();
}

// POST: Crear un nuevo ejercicio
function createExercise(exerciseData) {
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
                console.log("Error response:", text);
                throw new Error('No se pudo crear el ejercicio');
            });
        }
        return response.json();
    })
    .then(data => {
        getExercises();
        showNotification('Ejercicio creado correctamente', 'success');
    })
    .catch(error => {
        console.error('Error al crear ejercicio:', error);
        showNotification('Error al crear el ejercicio', 'error');
    });
}

// PUT: Actualizar un ejercicio existente
function updateExercise(id, exerciseData) {
    fetch(`http://localhost:8000/api/ejercicios/${id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(exerciseData)
    })
    .then(response => {
        if (!response.ok) throw new Error('No se pudo actualizar el ejercicio');
        return response.json();
    })
    .then(data => {
        getExercises();
        document.getElementById('edit-modal').classList.remove('active');
        showNotification('Ejercicio actualizado correctamente', 'success');
    })
    .catch(error => {
        console.error('Error al actualizar ejercicio:', error);
        showNotification('Error al actualizar el ejercicio', 'error');
    });
}

// DELETE: Eliminar un ejercicio
function deleteExercise(id) {
    fetch(`http://localhost:8000/api/ejercicios/${id}/`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) throw new Error('No se pudo eliminar el ejercicio');
        closeModals();
        getExercises();
        showNotification('Ejercicio eliminado correctamente', 'success');
    })
    .catch(error => {
        console.error('Error al eliminar ejercicio:', error);
        showNotification('Error al eliminar el ejercicio', 'error');
    });
}

// Función para abrir modal de edición
function openEditModal(exerciseId) {
    // Obtener datos del ejercicio
    fetch(`http://localhost:8000/api/ejercicios/${exerciseId}/`)
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar el ejercicio');
            return response.json();
        })
        .then(exercise => {
            // Llenar el formulario con los datos del ejercicio
            document.getElementById('edit-exercise-id').value = exercise.id;
            document.getElementById('edit-exercise-name').value = exercise.name || '';
            document.getElementById('edit-muscle-group').value = exercise.muscle_group || '';
            document.getElementById('edit-exercise-description').value = exercise.description || '';
            
            // Mostrar el modal
            document.getElementById('edit-modal').classList.add('active');
        })
        .catch(error => {
            console.error('Error al cargar ejercicio:', error);
            showNotification('Error al cargar el ejercicio', 'error');
        });
}

// Función para manejar el envío del formulario de edición
function handleEditSubmit() {
    const id = document.getElementById('edit-exercise-id').value;
    const name = document.getElementById('edit-exercise-name').value.trim();
    const muscleGroup = document.getElementById('edit-muscle-group').value;
    const description = document.getElementById('edit-exercise-description').value.trim();

    // Validación
    if (!name || !muscleGroup) {
        showNotification('Por favor completa los campos requeridos (*)', 'error');
        return;
    }

    const exerciseData = {
        name: name,
        muscle_group: muscleGroup,
        description: description || ""
    };

    updateExercise(id, exerciseData);
}

function renderExercisesTable(exercises) {
    const tbody = document.getElementById('exercises-table-body');
    if (!tbody) {
        console.warn("Elemento #exercises-table-body no encontrado en el DOM.");
        return;
    }

    if (!Array.isArray(exercises) || exercises.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 30px;">
                    <i class="fas fa-dumbbell" style="font-size: 48px; color: #32CD32; margin-bottom: 15px;"></i>
                    <h3>No se encontraron ejercicios</h3>
                    <p>${allExercises.length === 0 ? 'Comienza agregando tu primer ejercicio' : 'Intenta con otros criterios de búsqueda'}</p>
                    ${allExercises.length === 0 ? 
                        `<a href="nuevo-ejercicio.html" class="btn btn-white" style="margin-top: 15px;">
                            <i class="fas fa-plus"></i> Agregar primer ejercicio
                        </a>` : 
                        `<button class="btn btn-white" onclick="resetAllFilters()" style="margin-top: 15px;">
                            <i class="fas fa-redo"></i> Mostrar todos los ejercicios
                        </button>`
                    }
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = exercises.map(exercise => `
        <tr>
            <td>${exercise.name || '-'}</td>
            <td>${capitalizeFirstLetter(exercise.muscle_group)}</td>
            <td>${exercise.description || '-'}</td>
            <td class="actions-cell">
                <button class="action-btn edit-btn" data-id="${exercise.id}" title="Editar ejercicio">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="action-btn delete-btn" data-id="${exercise.id}" title="Eliminar ejercicio">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Eventos para botones de editar
    const editBtns = document.querySelectorAll('.edit-btn');
    if (editBtns && editBtns.length) {
        editBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                const exerciseId = parseInt(this.dataset.id);
                openEditModal(exerciseId);
            });
        });
    }

    // Eventos para botones de eliminar
    const deleteBtns = document.querySelectorAll('.delete-btn');
    if (deleteBtns && deleteBtns.length) {
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                currentExerciseId = parseInt(this.dataset.id);
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

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notificacion ${type}`;
    
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    
    notification.innerHTML = `
        <div class="notificacion-contenido">
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
        notification.classList.add('mostrar');
    }, 10);
    
    // Ocultar y eliminar después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('mostrar');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Función para manejar el formulario de nuevo ejercicio (si existe en la página)
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('exercise-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('exercise-name').value.trim();
            const muscleGroup = document.getElementById('muscle-group').value;
            const description = document.getElementById('exercise-description').value.trim();

            // Validación mejorada
            if (!name || !muscleGroup) {
                showNotification('Por favor completa los campos requeridos (*)', 'error');
                return;
            }

            // Verificar que muscle_group no esté vacío
            if (muscleGroup === "" || muscleGroup === null || muscleGroup === undefined) {
                showNotification('Por favor selecciona un grupo muscular válido', 'error');
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
                showNotification('Ejercicio guardado exitosamente!', 'success');
                // Limpiar formulario
                form.reset();
                // Redirigir después de 1 segundo
                setTimeout(() => {
                    window.location.href = 'ejercicios.html';
                }, 1000);
            })
            .catch(error => {
                showNotification('Ocurrió un problema al guardar el ejercicio: ' + error.message, 'error');
            });
        });

        // Botón cancelar en nuevo ejercicio
        const cancelBtn = document.getElementById('cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                window.location.href = 'ejercicios.html';
            });
        }
    }
});