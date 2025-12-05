// entidades/static/entrenador/js/pages/ejercicios.js
class EjerciciosPage {
    constructor() {
        this.initialized = false;
        this.exercises = [];
        this.filteredExercises = [];
        this.muscleGroups = [];
        this.muscleSubgroups = [];
        this.apiBaseUrl = '/entrenador/api/';
        this.currentExerciseId = null;
        this.searchTimeout = null;
    }


    initialize() {
        if (this.initialized) return;
       
        this.initialized = true;
        console.log('Inicializando página de ejercicios');
       
        this.initEventListeners();
        this.loadMuscleGroups().then(() => {
            this.loadMuscleSubgroups();
            this.loadExercises();
        });
    }


    initEventListeners() {
        // Botones de filtros
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.filterExercises();
                }, 300);
            });
        }


        const resetButton = document.getElementById('reset-filters');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetFilters();
            });
        }


        // Modal de eliminación
        const cancelDelete = document.getElementById('cancel-delete');
        const confirmDelete = document.getElementById('confirm-delete');
       
        if (cancelDelete) {
            cancelDelete.addEventListener('click', () => this.hideDeleteModal());
        }
       
        if (confirmDelete) {
            confirmDelete.addEventListener('click', () => this.deleteExercise());
        }


        // Modal de edición
        const closeEditModal = document.getElementById('close-edit-modal');
        const cancelEditBtn = document.getElementById('cancel-edit-btn');
       
        if (closeEditModal) {
            closeEditModal.addEventListener('click', () => this.hideEditModal());
        }
       
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => this.hideEditModal());
        }


        // Formulario de edición
        const editForm = document.getElementById('edit-exercise-form');
        if (editForm) {
            editForm.addEventListener('submit', (e) => this.saveExercise(e));
        }


        // Cerrar modales al hacer click fuera
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });


        // Cambio en grupo muscular para cargar subgrupos
        const muscleGroupSelect = document.getElementById('edit-muscle-group');
        if (muscleGroupSelect) {
            muscleGroupSelect.addEventListener('change', (e) => {
                this.loadSubgroupsForGroup(e.target.value);
            });
        }


        // Inicializar selects personalizados
        this.initCustomSelects();
    }


    initCustomSelects() {
        const customSelects = document.querySelectorAll('.custom-select');
       
        customSelects.forEach(select => {
            const trigger = select.querySelector('.select-trigger');
            const options = select.querySelector('.select-options');
            const selectedValue = select.querySelector('.selected-value');
            const optionsList = select.querySelectorAll('.select-option');
           
            if (!trigger || !options || !selectedValue || optionsList.length === 0) return;
           
            trigger.addEventListener('click', function(e) {
                e.stopPropagation();
               
                document.querySelectorAll('.select-options.active').forEach(opt => {
                    if (opt !== options) {
                        opt.classList.remove('active');
                    }
                });
               
                options.classList.toggle('active');
                trigger.classList.toggle('active');
            });
           
            optionsList.forEach(option => {
                option.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const value = this.getAttribute('data-value');
                    const text = this.querySelector('span').textContent;
                    const icon = this.querySelector('i').cloneNode(true);
                   
                    selectedValue.innerHTML = '';
                    selectedValue.appendChild(icon);
                    selectedValue.innerHTML += `<span>${text}</span>`;
                   
                    trigger.classList.remove('active');
                    options.classList.remove('active');
                   
                    setTimeout(() => {
                        window.ejerciciosPage.filterExercises();
                    }, 100);
                });
            });
        });
       
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.custom-select')) {
                document.querySelectorAll('.select-options.active').forEach(options => {
                    options.classList.remove('active');
                });
                document.querySelectorAll('.select-trigger.active').forEach(trigger => {
                    trigger.classList.remove('active');
                });
            }
        });
    }


    async loadMuscleGroups() {
        try {
            const response = await fetch(`${this.apiBaseUrl}muscle-groups/`);
            if (!response.ok) throw new Error('Error cargando grupos musculares');
            this.muscleGroups = await response.json();
            this.populateMuscleGroupSelect();
            this.populateEditMuscleGroupSelect();
        } catch (error) {
            console.error('Error cargando grupos musculares:', error);
            // Si falla, usar los grupos por defecto
            this.muscleGroups = [
                { id: 1, name: 'Pectorales' },
                { id: 2, name: 'Espalda' },
                { id: 3, name: 'Hombros' },
                { id: 4, name: 'Bíceps' },
                { id: 5, name: 'Tríceps' },
                { id: 6, name: 'Piernas' },
                { id: 7, name: 'Abdominales' }
            ];
            this.populateMuscleGroupSelect();
            this.populateEditMuscleGroupSelect();
        }
    }


    async loadMuscleSubgroups() {
        try {
            const response = await fetch(`${this.apiBaseUrl}muscle-subgroups/`);
            if (!response.ok) throw new Error('Error cargando subgrupos musculares');
            this.muscleSubgroups = await response.json();
        } catch (error) {
            console.error('Error cargando subgrupos musculares:', error);
            this.muscleSubgroups = [];
        }
    }


    async loadSubgroupsForGroup(muscleGroupId) {
        const subgroupSelect = document.getElementById('edit-muscle-subgroup');
        if (!subgroupSelect) return;


        // Limpiar opciones excepto la primera
        subgroupSelect.innerHTML = '<option value="">Selecciona un subgrupo muscular</option>';


        if (!muscleGroupId) return;


        try {
            const response = await fetch(`${this.apiBaseUrl}muscle-subgroups/?muscle_group=${muscleGroupId}`);
            if (!response.ok) throw new Error('Error cargando subgrupos');
           
            const subgroups = await response.json();
            subgroups.forEach(subgroup => {
                const option = document.createElement('option');
                option.value = subgroup.id;
                option.textContent = subgroup.name;
                subgroupSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error cargando subgrupos:', error);
        }
    }


    populateMuscleGroupSelect() {
        const muscleGroupSelect = document.querySelector('#muscle-group-select .select-options');
        if (!muscleGroupSelect) return;


        // Limpiar opciones excepto la primera
        const defaultOption = muscleGroupSelect.querySelector('.select-option[data-value=""]');
        muscleGroupSelect.innerHTML = '';
        if (defaultOption) {
            muscleGroupSelect.appendChild(defaultOption);
        }


        // Agregar grupos musculares desde la base de datos
        this.muscleGroups.forEach(group => {
            const option = document.createElement('div');
            option.className = 'select-option';
            option.setAttribute('data-value', group.id);
            option.innerHTML = `
                <i class="fas fa-chess-rook"></i>
                <span>${group.name}</span>
            `;
           
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const text = group.name;
                const selectedValue = document.querySelector('#muscle-group-select .selected-value');
                selectedValue.innerHTML = `<i class="fas fa-chess-rook"></i><span>${text}</span>`;
                selectedValue.setAttribute('data-value', group.id);
               
                document.querySelector('#muscle-group-select .select-trigger').classList.remove('active');
                muscleGroupSelect.classList.remove('active');
               
                setTimeout(() => {
                    this.filterExercises();
                }, 100);
            });
           
            muscleGroupSelect.appendChild(option);
        });
    }


    populateEditMuscleGroupSelect() {
        const muscleGroupSelect = document.getElementById('edit-muscle-group');
        if (!muscleGroupSelect) return;


        // Limpiar opciones excepto la primera
        muscleGroupSelect.innerHTML = '<option value="">Selecciona un grupo muscular</option>';


        // Agregar grupos musculares desde la base de datos
        this.muscleGroups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = group.name;
            muscleGroupSelect.appendChild(option);
        });
    }


    async loadExercises() {
        try {
            console.log('Cargando ejercicios desde el backend...');
           
            const response = await fetch(`${this.apiBaseUrl}ejercicios/`);
            if (!response.ok) {
                throw new Error('Error al cargar los ejercicios');
            }
           
            this.exercises = await response.json();
            this.filteredExercises = [...this.exercises];
            this.renderTable();
           
        } catch (error) {
            console.error('Error cargando ejercicios:', error);
            this.showError('Error al cargar los ejercicios');
            // Mostrar tabla vacía
            this.renderTable();
        }
    }


    renderTable() {
        const tbody = document.getElementById('exercises-table-body');
        if (!tbody) return;


        // Quitar la fila de carga
        const loadingRow = document.getElementById('loading-row');
        if (loadingRow) {
            loadingRow.remove();
        }


        if (this.filteredExercises.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center; padding: 30px; color: var(--text-secondary);">
                        <i class="fas fa-info-circle" style="margin-right: 8px;"></i>
                        No se encontraron ejercicios
                    </td>
                </tr>
            `;
            return;
        }


        tbody.innerHTML = this.filteredExercises.map(exercise => `
            <tr>
                <td>${exercise.name}</td>
                <td>
                    <span class="muscle-group-badge muscle-${exercise.muscle_group_name ? exercise.muscle_group_name.toLowerCase().replace(/[^a-z]/g, '-') : 'none'}">
                        ${exercise.muscle_group_name || 'Sin grupo'}
                        ${exercise.muscle_subgroup_name ? `<br><small>${exercise.muscle_subgroup_name}</small>` : ''}
                    </span>
                </td>
                <td class="exercise-description">${exercise.description || 'Sin descripción'}</td>
                <td>
                    <div class="actions-cell">
                        <button class="action-btn edit-btn" onclick="window.ejerciciosPage.editExercise(${exercise.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="window.ejerciciosPage.showDeleteModal(${exercise.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }


    filterExercises() {
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const selectedValue = document.querySelector('#muscle-group-select .selected-value');
        const muscleFilterId = selectedValue?.getAttribute('data-value') || '';


        this.filteredExercises = this.exercises.filter(exercise => {
            const matchesSearch = exercise.name.toLowerCase().includes(searchTerm) ||
                                 (exercise.description && exercise.description.toLowerCase().includes(searchTerm));
           
            const matchesMuscle = muscleFilterId ?
                exercise.muscle_group == muscleFilterId :
                true;
           
            return matchesSearch && matchesMuscle;
        });


        this.renderTable();
    }


    resetFilters() {
        const muscleSelect = document.querySelector('#muscle-group-select .selected-value');
        if (muscleSelect) {
            muscleSelect.innerHTML = '<i class="fas fa-list"></i><span>Todos los grupos musculares</span>';
            muscleSelect.removeAttribute('data-value');
        }
       
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
       
        this.filteredExercises = [...this.exercises];
        this.renderTable();
    }


    async editExercise(id) {
        try {
            const response = await fetch(`${this.apiBaseUrl}ejercicios/${id}/`);
            if (!response.ok) throw new Error('Error cargando ejercicio');
           
            const exercise = await response.json();
           
            // Llenar formulario de edición
            document.getElementById('edit-exercise-id').value = exercise.id;
            document.getElementById('edit-exercise-name').value = exercise.name;
           
            // Cargar y seleccionar grupo muscular
            const muscleGroupSelect = document.getElementById('edit-muscle-group');
            if (muscleGroupSelect) {
                muscleGroupSelect.value = exercise.muscle_group || '';
               
                // Cargar subgrupos para este grupo
                if (exercise.muscle_group) {
                    await this.loadSubgroupsForGroup(exercise.muscle_group);
                   
                    // Esperar un momento para que se carguen los subgrupos
                    setTimeout(() => {
                        const subgroupSelect = document.getElementById('edit-muscle-subgroup');
                        if (subgroupSelect) {
                            subgroupSelect.value = exercise.muscle_subgroup || '';
                        }
                    }, 100);
                }
            }
           
            document.getElementById('edit-exercise-description').value = exercise.description || '';
           
            this.showEditModal();
        } catch (error) {
            console.error('Error cargando ejercicio:', error);
            this.showError('Error al cargar el ejercicio');
        }
    }


    showEditModal() {
        const modal = document.getElementById('edit-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }


    hideEditModal() {
        const modal = document.getElementById('edit-modal');
        if (modal) {
            modal.style.display = 'none';
            // Resetear formulario
            document.getElementById('edit-exercise-form').reset();
            document.getElementById('edit-exercise-id').value = '';
            // Resetear subgrupos
            const subgroupSelect = document.getElementById('edit-muscle-subgroup');
            if (subgroupSelect) {
                subgroupSelect.innerHTML = '<option value="">Selecciona un subgrupo muscular</option>';
            }
        }
    }


    showDeleteModal(id) {
        this.currentExerciseId = id;
        const modal = document.getElementById('delete-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }


    hideDeleteModal() {
        const modal = document.getElementById('delete-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentExerciseId = null;
    }


    async saveExercise(e) {
        e.preventDefault();
       
        const id = document.getElementById('edit-exercise-id').value;
        const exerciseData = {
            name: document.getElementById('edit-exercise-name').value,
            muscle_group: document.getElementById('edit-muscle-group').value || null,
            muscle_subgroup: document.getElementById('edit-muscle-subgroup').value || null,
            description: document.getElementById('edit-exercise-description').value,
        };


        // Validaciones
        if (!exerciseData.name.trim()) {
            this.showError('El nombre del ejercicio es obligatorio');
            return;
        }


        try {
            const url = id ?
                `${this.apiBaseUrl}ejercicios/${id}/` :
                `${this.apiBaseUrl}ejercicios/`;
           
            const method = id ? 'PUT' : 'POST';
           
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify(exerciseData)
            });


            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al guardar el ejercicio');
            }


            this.hideEditModal();
            this.showNotification(id ? 'Ejercicio actualizado correctamente' : 'Ejercicio creado correctamente', 'success');
            await this.loadExercises();
           
        } catch (error) {
            console.error('Error al guardar ejercicio:', error);
            this.showError(error.message);
        }
    }


    async deleteExercise() {
        if (!this.currentExerciseId) return;


        try {
            const response = await fetch(`${this.apiBaseUrl}ejercicios/${this.currentExerciseId}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': this.getCSRFToken()
                }
            });


            if (!response.ok) {
                throw new Error('Error al eliminar el ejercicio');
            }


            this.hideDeleteModal();
            this.showNotification('Ejercicio eliminado correctamente', 'success');
            await this.loadExercises();
           
        } catch (error) {
            console.error('Error al eliminar ejercicio:', error);
            this.showError('Error al eliminar el ejercicio');
        }
    }


    getCSRFToken() {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
        return cookieValue || '';
    }


    showError(message) {
        this.showNotification(message, 'error');
    }


    showNotification(message, type = 'success') {
        // Crear notificación toast
        const toast = document.createElement('div');
        toast.className = `notification notification-${type}`;
        toast.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
       
        document.body.appendChild(toast);
       
        // Mostrar con animación
        setTimeout(() => toast.classList.add('show'), 10);
       
        // Ocultar después de 3 segundos
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}


// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    window.ejerciciosPage = new EjerciciosPage();
    window.ejerciciosPage.initialize();
});
