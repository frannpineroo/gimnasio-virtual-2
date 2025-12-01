// entidades/static/entrenador/js/pages/musculos.js
class MusculosPage {
    constructor() {
        this.initialized = false;
        this.muscles = [];
        this.filteredMuscles = [];
        this.muscleGroups = [];
    }

    initialize() {
        if (this.initialized) return;
        
        this.initialized = true;
        console.log('Inicializando página de músculos');
        
        this.initEventListeners();
        this.loadMuscles();
        this.loadMuscleGroups();
    }

    initEventListeners() {
        // Botones de acción
        const addGroupBtn = document.getElementById('add-group-btn');
        if (addGroupBtn) {
            addGroupBtn.addEventListener('click', () => this.openGroupModal());
        }

        const addSubgroupBtn = document.getElementById('add-subgroup-btn');
        if (addSubgroupBtn) {
            addSubgroupBtn.addEventListener('click', () => this.openSubgroupModal());
        }

        // Filtros
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.filterMuscles();
                }, 300);
            });
        }

        const resetButton = document.getElementById('reset-filters');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetFilters();
            });
        }

        // Modal de grupos
        const closeGroupModal = document.getElementById('close-group-modal');
        const cancelGroupForm = document.getElementById('cancel-group-form');
        
        if (closeGroupModal) {
            closeGroupModal.addEventListener('click', () => this.closeGroupModal());
        }
        
        if (cancelGroupForm) {
            cancelGroupForm.addEventListener('click', () => this.closeGroupModal());
        }

        // Modal de subgrupos
        const closeSubgroupModal = document.getElementById('close-subgroup-modal');
        const cancelSubgroupForm = document.getElementById('cancel-subgroup-form');
        
        if (closeSubgroupModal) {
            closeSubgroupModal.addEventListener('click', () => this.closeSubgroupModal());
        }
        
        if (cancelSubgroupForm) {
            cancelSubgroupForm.addEventListener('click', () => this.closeSubgroupModal());
        }

        // Formularios
        const groupForm = document.getElementById('group-form');
        if (groupForm) {
            groupForm.addEventListener('submit', (e) => this.saveGroup(e));
        }

        const subgroupForm = document.getElementById('subgroup-form');
        if (subgroupForm) {
            subgroupForm.addEventListener('submit', (e) => this.saveSubgroup(e));
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
                        window.musculosPage.filterMuscles();
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

    async loadMuscles() {
        try {
            console.log('Cargando músculos desde el backend...');
            
            // TODO: Conectar con API real
            // const response = await fetch('/entrenador/api/musculos/');
            // this.muscles = await response.json();
            
            // Datos de ejemplo temporalmente
            this.muscles = [
                {
                    id: 1,
                    name: "Pectorales",
                    type: "group",
                    parent: null,
                    exercises_count: 15,
                    parent_name: null
                },
                {
                    id: 2,
                    name: "Pectoral Mayor",
                    type: "subgroup",
                    parent: 1,
                    exercises_count: 8,
                    parent_name: "Pectorales"
                },
                {
                    id: 3,
                    name: "Pectoral Menor",
                    type: "subgroup",
                    parent: 1,
                    exercises_count: 5,
                    parent_name: "Pectorales"
                },
                {
                    id: 4,
                    name: "Espalda",
                    type: "group",
                    parent: null,
                    exercises_count: 20,
                    parent_name: null
                },
                {
                    id: 5,
                    name: "Dorsal Ancho",
                    type: "subgroup",
                    parent: 4,
                    exercises_count: 12,
                    parent_name: "Espalda"
                }
            ];
            
            this.filteredMuscles = [...this.muscles];
            this.renderTable();
            
        } catch (error) {
            console.error('Error cargando músculos:', error);
            this.showError('Error al cargar los músculos');
            
            const tbody = document.getElementById('muscles-table-body');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align:center; padding: 30px; color: #dc3545;">
                            <i class="fas fa-exclamation-triangle"></i> Error al cargar músculos
                        </td>
                    </tr>
                `;
            }
        }
    }

    async loadMuscleGroups() {
        try {
            // Cargar grupos musculares para el select
            // const response = await fetch('/entrenador/api/musculos/?type=group');
            // this.muscleGroups = await response.json();
            
            // Datos de ejemplo
            this.muscleGroups = this.muscles.filter(m => m.type === 'group');
            this.populateGroupSelect();
            
        } catch (error) {
            console.error('Error cargando grupos musculares:', error);
        }
    }

    populateGroupSelect() {
        const parentSelect = document.getElementById('subgroup-parent');
        if (!parentSelect) return;

        // Limpiar opciones (manteniendo la primera opción vacía)
        parentSelect.innerHTML = '<option value="">Seleccionar grupo</option>';
        
        // Agregar grupos
        this.muscleGroups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = group.name;
            parentSelect.appendChild(option);
        });
    }

    renderTable() {
        const tbody = document.getElementById('muscles-table-body');
        if (!tbody) return;

        if (this.filteredMuscles.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; padding: 30px; color: var(--text-secondary);">
                        No se encontraron músculos
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredMuscles.map(muscle => `
            <tr>
                <td>${muscle.name}</td>
                <td>
                    <span class="type-badge type-${muscle.type}">
                        ${muscle.type === 'group' ? 'Grupo' : 'Subgrupo'}
                    </span>
                </td>
                <td>${muscle.parent_name || '-'}</td>
                <td>
                    <span class="exercises-count">
                        ${muscle.exercises_count} ejercicios
                    </span>
                </td>
                <td>
                    <div class="actions-cell">
                        <button class="action-btn edit-btn" onclick="musculosPage.editMuscle(${muscle.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="musculosPage.deleteMuscle(${muscle.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    filterMuscles() {
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const typeSelect = document.querySelector('#type-select .selected-value span');
        const typeFilter = typeSelect?.textContent !== 'Todos los tipos' ? 
                           typeSelect?.getAttribute('data-value') : '';

        this.filteredMuscles = this.muscles.filter(muscle => {
            const matchesSearch = muscle.name.toLowerCase().includes(searchTerm);
            const matchesType = typeFilter ? muscle.type === typeFilter : true;
            
            return matchesSearch && matchesType;
        });

        this.renderTable();
    }

    resetFilters() {
        const typeSelect = document.querySelector('#type-select .selected-value');
        if (typeSelect) {
            typeSelect.innerHTML = '<i class="fas fa-list"></i><span>Todos los tipos</span>';
        }
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.filteredMuscles = [...this.muscles];
        this.renderTable();
    }

    openGroupModal() {
        const modal = document.getElementById('group-modal');
        if (modal) {
            document.getElementById('group-modal-title').textContent = 'Nuevo Grupo Muscular';
            document.getElementById('group-id').value = '';
            document.getElementById('group-name').value = '';
            modal.style.display = 'flex';
        }
    }

    closeGroupModal() {
        const modal = document.getElementById('group-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    openSubgroupModal() {
        const modal = document.getElementById('subgroup-modal');
        if (modal) {
            document.getElementById('subgroup-modal-title').textContent = 'Nuevo Subgrupo Muscular';
            document.getElementById('subgroup-id').value = '';
            document.getElementById('subgroup-name').value = '';
            document.getElementById('subgroup-parent').value = '';
            modal.style.display = 'flex';
        }
    }

    closeSubgroupModal() {
        const modal = document.getElementById('subgroup-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    async saveGroup(e) {
        e.preventDefault();
        
        const id = document.getElementById('group-id').value;
        const name = document.getElementById('group-name').value;
        
        if (!name) {
            this.showError('Por favor, ingresa un nombre para el grupo');
            return;
        }
        
        try {
            // TODO: Implementar guardado real
            console.log('Guardando grupo:', { id, name });
            this.closeGroupModal();
            this.showSuccess('Grupo guardado correctamente');
            await this.loadMuscles();
            
        } catch (error) {
            console.error('Error guardando grupo:', error);
            this.showError('Error al guardar el grupo: ' + error.message);
        }
    }

    async saveSubgroup(e) {
        e.preventDefault();
        
        const id = document.getElementById('subgroup-id').value;
        const name = document.getElementById('subgroup-name').value;
        const parent = document.getElementById('subgroup-parent').value;
        
        if (!name || !parent) {
            this.showError('Por favor, completa todos los campos obligatorios');
            return;
        }
        
        try {
            // TODO: Implementar guardado real
            console.log('Guardando subgrupo:', { id, name, parent });
            this.closeSubgroupModal();
            this.showSuccess('Subgrupo guardado correctamente');
            await this.loadMuscles();
            
        } catch (error) {
            console.error('Error guardando subgrupo:', error);
            this.showError('Error al guardar el subgrupo: ' + error.message);
        }
    }

    editMuscle(id) {
        const muscle = this.muscles.find(m => m.id === id);
        if (!muscle) return;

        if (muscle.type === 'group') {
            this.openGroupModal();
            document.getElementById('group-modal-title').textContent = 'Editar Grupo Muscular';
            document.getElementById('group-id').value = muscle.id;
            document.getElementById('group-name').value = muscle.name;
        } else {
            this.openSubgroupModal();
            document.getElementById('subgroup-modal-title').textContent = 'Editar Subgrupo Muscular';
            document.getElementById('subgroup-id').value = muscle.id;
            document.getElementById('subgroup-name').value = muscle.name;
            document.getElementById('subgroup-parent').value = muscle.parent;
        }
    }

    async deleteMuscle(id) {
        const muscle = this.muscles.find(m => m.id === id);
        if (!muscle) return;

        const typeName = muscle.type === 'group' ? 'grupo' : 'subgrupo';
        if (confirm(`¿Estás seguro de que deseas eliminar el ${typeName} "${muscle.name}"? Esta acción no se puede deshacer.`)) {
            try {
                // TODO: Implementar eliminación real
                console.log('Eliminando músculo:', id);
                this.showSuccess(`${muscle.type === 'group' ? 'Grupo' : 'Subgrupo'} eliminado correctamente`);
                await this.loadMuscles();
                
            } catch (error) {
                console.error('Error eliminando músculo:', error);
                this.showError('Error al eliminar el músculo: ' + error.message);
            }
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
    window.musculosPage = new MusculosPage();
    window.musculosPage.initialize();
});