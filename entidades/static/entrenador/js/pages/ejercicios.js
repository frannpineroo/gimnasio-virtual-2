// entidades/static/entrenador/js/pages/ejercicios.js
class EjerciciosPage {
    constructor() {
        this.initialized = false;
        this.exercises = [];
        this.filteredExercises = [];
    }

    initialize() {
        if (this.initialized) return;
        
        this.initialized = true;
        console.log('Inicializando página de ejercicios');
        
        this.initEventListeners();
        this.loadExercises();
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

    async loadExercises() {
        try {
            console.log('Cargando ejercicios desde el backend...');
            
            // TODO: Conectar con API real
            // const response = await fetch('/entrenador/api/ejercicios/');
            // this.exercises = await response.json();
            
            // Datos de ejemplo temporalmente
            this.exercises = [
                {
                    id: 1,
                    name: "Sentadilla con barra",
                    muscle_group: "piernas",
                    description: "Ejercicio compuesto para desarrollar fuerza en piernas y glúteos."
                },
                {
                    id: 2,
                    name: "Press de banca",
                    muscle_group: "pectorales",
                    description: "Ejercicio fundamental para desarrollar el pecho y tríceps."
                }
            ];
            
            this.filteredExercises = [...this.exercises];
            this.renderTable();
            
        } catch (error) {
            console.error('Error cargando ejercicios:', error);
            this.showError('Error al cargar los ejercicios');
        }
    }

    renderTable() {
        const tbody = document.getElementById('exercises-table-body');
        if (!tbody) return;

        if (this.filteredExercises.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center; padding: 30px; color: var(--text-secondary);">
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
                    <span class="muscle-group-badge muscle-${exercise.muscle_group}">
                        ${this.formatMuscleGroup(exercise.muscle_group)}
                    </span>
                </td>
                <td class="exercise-description">${exercise.description}</td>
                <td>
                    <div class="actions-cell">
                        <button class="action-btn edit-btn" onclick="ejerciciosPage.editExercise(${exercise.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="ejerciciosPage.showDeleteModal(${exercise.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    formatMuscleGroup(muscleGroup) {
        const groups = {
            'pectorales': 'Pectorales',
            'espalda': 'Espalda',
            'hombros': 'Hombros',
            'biceps': 'Bíceps',
            'triceps': 'Tríceps',
            'piernas': 'Piernas',
            'abdominales': 'Abdominales'
        };
        return groups[muscleGroup] || muscleGroup;
    }

    filterExercises() {
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const muscleSelect = document.querySelector('#muscle-group-select .selected-value span');
        const muscleFilter = muscleSelect?.textContent !== 'Todos los grupos musculares' ? 
                             muscleSelect?.textContent.toLowerCase() : '';

        this.filteredExercises = this.exercises.filter(exercise => {
            const matchesSearch = exercise.name.toLowerCase().includes(searchTerm) || 
                                 exercise.description.toLowerCase().includes(searchTerm);
            
            const matchesMuscle = muscleFilter ? 
                this.formatMuscleGroup(exercise.muscle_group).toLowerCase() === muscleFilter : 
                true;
            
            return matchesSearch && matchesMuscle;
        });

        this.renderTable();
    }

    resetFilters() {
        const muscleSelect = document.querySelector('#muscle-group-select .selected-value');
        if (muscleSelect) {
            muscleSelect.innerHTML = '<i class="fas fa-list"></i><span>Todos los grupos musculares</span>';
        }
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.filteredExercises = [...this.exercises];
        this.renderTable();
    }

    editExercise(id) {
        const exercise = this.exercises.find(e => e.id === id);
        if (exercise) {
            document.getElementById('edit-exercise-id').value = exercise.id;
            document.getElementById('edit-exercise-name').value = exercise.name;
            document.getElementById('edit-muscle-group').value = exercise.muscle_group;
            document.getElementById('edit-exercise-description').value = exercise.description;
            
            this.showEditModal();
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
        // TODO: Implementar guardado real
        console.log('Guardando ejercicio...');
        this.hideEditModal();
        this.showSuccess('Ejercicio guardado correctamente');
    }

    async deleteExercise() {
        if (this.currentExerciseId) {
            // TODO: Implementar eliminación real
            console.log('Eliminando ejercicio:', this.currentExerciseId);
            this.hideDeleteModal();
            this.showSuccess('Ejercicio eliminado correctamente');
            await this.loadExercises();
        }
    }

    showError(message) {
        console.error('Error:', message);
        alert('Error: ' + message);
    }

    showSuccess(message) {
        console.log('Éxito:', message);
        alert('Éxito: ' + message);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    window.ejerciciosPage = new EjerciciosPage();
    window.ejerciciosPage.initialize();
});