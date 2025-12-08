// entidades/static/entrenador/js/pages/musculos.js
class MusculosPage {
    constructor() {
        this.initialized = false;
        this.muscleGroups = [];
        this.muscleSubgroups = [];
        this.combinedMuscles = [];
        this.filteredMuscles = [];
        this.currentMuscleId = null;
        this.currentMuscleType = null;
        this.searchTimeout = null;
        this.apiBaseUrl = '/entrenador/api/';
    }

    initialize() {
        if (this.initialized) return;
       
        this.initialized = true;
        console.log('Inicializando página de músculos');
       
        this.initEventListeners();
        this.loadMuscleData();
    }

    async loadMuscleData() {
        try {
            console.log('Cargando datos de músculos...');
           
            // Mostrar loading
            const tbody = document.getElementById('muscles-table-body');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align:center; padding: 30px;">
                            <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #32CD32;"></i> Cargando músculos...
                        </td>
                    </tr>
                `;
            }

            // Cargar grupos musculares
            const groupsResponse = await fetch(`${this.apiBaseUrl}muscle-groups/`);
            if (!groupsResponse.ok) throw new Error('Error cargando grupos musculares');
            this.muscleGroups = await groupsResponse.json();
            console.log('Grupos musculares cargados:', this.muscleGroups.length);

            // Cargar subgrupos musculares
            const subgroupsResponse = await fetch(`${this.apiBaseUrl}muscle-subgroups/`);
            if (!subgroupsResponse.ok) throw new Error('Error cargando subgrupos musculares');
            this.muscleSubgroups = await subgroupsResponse.json();
            console.log('Subgrupos musculares cargados:', this.muscleSubgroups.length);

            // Combinar datos para la tabla
            this.combinedMuscles = this.combineMuscleData();
            this.filteredMuscles = [...this.combinedMuscles];
           
            console.log('Músculos combinados:', this.combinedMuscles.length);
            this.renderTable();
           
        } catch (error) {
            console.error('Error cargando músculos:', error);
            this.showError('Error al cargar los músculos. Verifica la conexión con el servidor.');
           
            const tbody = document.getElementById('muscles-table-body');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align:center; padding: 30px; color: #dc3545;">
                            <i class="fas fa-exclamation-triangle"></i> Error al cargar músculos
                            <br><small>${error.message}</small>
                        </td>
                    </tr>
                `;
            }
        }
    }

    combineMuscleData() {
        const combined = [];
       
        // Agregar grupos musculares
        this.muscleGroups.forEach(group => {
            combined.push({
                id: group.id,
                name: group.name,
                muscle_type: 'group',
                type_display: 'Grupo',
                parent: null,
                parent_name: null,
                description: group.description || '',
                exercises_count: this.getGroupExercisesCount(group.id),
                raw_data: group
            });
        });
       
        // Agregar subgrupos musculares
        this.muscleSubgroups.forEach(subgroup => {
            // Encontrar el nombre del grupo padre
            const parentGroup = this.muscleGroups.find(g => g.id === subgroup.muscle_group);
            const parentName = parentGroup ? parentGroup.name : 'Desconocido';
           
            combined.push({
                id: subgroup.id,
                name: subgroup.name,
                muscle_type: 'subgroup',
                type_display: 'Subgrupo',
                parent: subgroup.muscle_group,
                parent_name: parentName,
                description: subgroup.description || '',
                exercises_count: this.getSubgroupExercisesCount(subgroup.id),
                raw_data: subgroup
            });
        });
       
        return combined;
    }

    getGroupExercisesCount(groupId) {
        // Esta función debería contar ejercicios asociados a este grupo
        // Por ahora, retornaremos 0 y puedes implementar la lógica real después
        return 0;
    }

    getSubgroupExercisesCount(subgroupId) {
        // Esta función debería contar ejercicios asociados a este subgrupo
        // Por ahora, retornaremos 0 y puedes implementar la lógica real después
        return 0;
    }

    renderTable() {
        const tbody = document.getElementById('muscles-table-body');
        if (!tbody) {
            console.error('No se encontró el tbody con id muscles-table-body');
            return;
        }

        console.log('Renderizando tabla con', this.filteredMuscles.length, 'músculos');
       
        if (this.filteredMuscles.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; padding: 30px; color: var(--text-secondary);">
                        <i class="fas fa-info-circle"></i> No se encontraron músculos
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredMuscles.map(muscle => {
            return `
            <tr data-muscle-id="${muscle.id}" data-muscle-type="${muscle.muscle_type}">
                <td>${this.escapeHtml(muscle.name)}</td>
                <td>
                    <span class="type-badge type-${muscle.muscle_type}">
                        ${muscle.type_display}
                    </span>
                </td>
                <td>${this.escapeHtml(muscle.parent_name || '-')}</td>
                <td>
                    <span class="exercises-count">
                        ${muscle.exercises_count} ejercicios
                    </span>
                </td>
                <td>
                    <div class="actions-cell">
                        <button class="action-btn edit-btn" data-id="${muscle.id}" data-type="${muscle.muscle_type}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" data-id="${muscle.id}" data-type="${muscle.muscle_type}" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
            `;
        }).join('');
       
        this.initTableButtons();
    }
   
    escapeHtml(text) {
        if (!text) return '-';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
   
    initTableButtons() {
        // Botones de editar
        const editButtons = document.querySelectorAll('.edit-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const muscleId = button.getAttribute('data-id');
                const muscleType = button.getAttribute('data-type');
                console.log('Editando músculo:', muscleId, 'tipo:', muscleType);
                this.editMuscle(muscleId, muscleType);
            });
        });
       
        // Botones de eliminar
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const muscleId = button.getAttribute('data-id');
                const muscleType = button.getAttribute('data-type');
                console.log('Eliminando músculo:', muscleId, 'tipo:', muscleType);
                this.deleteMuscle(muscleId, muscleType);
            });
        });
    }

    initEventListeners() {
        console.log('Inicializando event listeners...');
       
        // Botones de acción
        const addGroupBtn = document.getElementById('add-group-btn');
        if (addGroupBtn) {
            addGroupBtn.addEventListener('click', () => this.openGroupModal());
        }

        const addSubgroupBtn = document.getElementById('add-subgroup-btn');
        if (addSubgroupBtn) {
            addSubgroupBtn.addEventListener('click', () => this.openSubgroupModal());
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

        // Filtros
        this.initFilters();
        this.initCustomSelects();
    }

    initFilters() {
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
                   
                    select.setAttribute('data-selected-value', value);
                   
                    trigger.classList.remove('active');
                    options.classList.remove('active');
                   
                    setTimeout(() => {
                        console.log('Filtrando por:', value);
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

    filterMuscles() {
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const typeSelect = document.querySelector('#type-select');
       
        const typeValue = typeSelect?.getAttribute('data-selected-value') || '';
       
        console.log('Filtrando con término:', searchTerm, 'tipo:', typeValue);
       
        this.filteredMuscles = this.combinedMuscles.filter(muscle => {
            const name = (muscle.name || '').toLowerCase();
            const muscleType = muscle.muscle_type || '';
           
            const matchesSearch = name.includes(searchTerm);
            const matchesType = typeValue ? muscleType === typeValue : true;
           
            return matchesSearch && matchesType;
        });

        console.log('Resultados filtrados:', this.filteredMuscles.length);
        this.renderTable();
    }

    resetFilters() {
        const typeSelect = document.querySelector('#type-select');
       
        const typeSelectedValue = typeSelect?.querySelector('.selected-value');
        if (typeSelectedValue) {
            typeSelectedValue.innerHTML = '<i class="fas fa-list"></i><span>Todos los tipos</span>';
            typeSelect.removeAttribute('data-selected-value');
        }
       
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
       
        this.filteredMuscles = [...this.combinedMuscles];
        console.log('Filtros reseteados, mostrando:', this.filteredMuscles.length, 'músculos');
        this.renderTable();
    }

    openGroupModal(muscleId = null) {
        const modal = document.getElementById('group-modal');
        if (!modal) return;
       
        const isEdit = !!muscleId;
       
        document.getElementById('group-modal-title').textContent = isEdit ? 'Editar Grupo Muscular' : 'Nuevo Grupo Muscular';
        document.getElementById('group-id').value = muscleId || '';
       
        if (isEdit) {
            this.loadGroupData(muscleId);
        } else {
            document.getElementById('group-name').value = '';
        }
       
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeGroupModal() {
        const modal = document.getElementById('group-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    openSubgroupModal(muscleId = null) {
        const modal = document.getElementById('subgroup-modal');
        if (!modal) return;
       
        const isEdit = !!muscleId;
       
        document.getElementById('subgroup-modal-title').textContent = isEdit ? 'Editar Subgrupo Muscular' : 'Nuevo Subgrupo Muscular';
        document.getElementById('subgroup-id').value = muscleId || '';
       
        // Cargar grupos musculares en el select
        this.populateGroupSelect();
       
        if (isEdit) {
            this.loadSubgroupData(muscleId);
        } else {
            document.getElementById('subgroup-name').value = '';
            document.getElementById('subgroup-parent').value = '';
        }
       
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeSubgroupModal() {
        const modal = document.getElementById('subgroup-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    populateGroupSelect() {
        const parentSelect = document.getElementById('subgroup-parent');
        if (!parentSelect) return;

        // Limpiar opciones (manteniendo la primera opción vacía)
        parentSelect.innerHTML = '<option value="">Seleccionar grupo</option>';
       
        // Agregar grupos musculares
        this.muscleGroups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = group.name;
            parentSelect.appendChild(option);
        });
    }

    loadGroupData(id) {
        console.log('Cargando datos del grupo ID:', id);
        const group = this.muscleGroups.find(g => g.id == id);
        if (group) {
            console.log('Grupo encontrado:', group);
            document.getElementById('group-id').value = group.id;
            document.getElementById('group-name').value = group.name || '';
        } else {
            console.error('Grupo no encontrado con ID:', id);
            this.showError('Grupo no encontrado');
        }
    }

    loadSubgroupData(id) {
        console.log('Cargando datos del subgrupo ID:', id);
        const subgroup = this.muscleSubgroups.find(s => s.id == id);
        if (subgroup) {
            console.log('Subgrupo encontrado:', subgroup);
            document.getElementById('subgroup-id').value = subgroup.id;
            document.getElementById('subgroup-name').value = subgroup.name || '';
            document.getElementById('subgroup-parent').value = subgroup.muscle_group || '';
        } else {
            console.error('Subgrupo no encontrado con ID:', id);
            this.showError('Subgrupo no encontrado');
        }
    }

    async saveGroup(e) {
        e.preventDefault();
        console.log('Guardando grupo muscular...');
       
        const name = document.getElementById('group-name').value.trim();
       
        if (!name) {
            this.showError('Por favor, ingresa un nombre para el grupo');
            return;
        }
       
        const id = document.getElementById('group-id').value;
        const groupData = {
            name: name,
            description: '' // Puedes agregar un campo de descripción si lo necesitas
        };
       
        console.log('Datos del grupo:', groupData);
        console.log('ID:', id);
       
        try {
            const options = {
                method: id ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken(),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(groupData)
            };

            const url = id ? `${this.apiBaseUrl}muscle-groups/${id}/` : `${this.apiBaseUrl}muscle-groups/`;
            console.log('Enviando a:', url, 'con método:', options.method);
           
            const response = await fetch(url, options);
           
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error del servidor:', errorData);
               
                let errorMessage = 'Error al guardar el grupo';
                if (errorData && typeof errorData === 'object') {
                    errorMessage = Object.values(errorData).flat().join(', ');
                }
               
                throw new Error(errorMessage);
            }
           
            const savedGroup = await response.json();
            console.log('Grupo guardado:', savedGroup);
           
            this.showSuccess(id ? 'Grupo actualizado correctamente!' : 'Grupo creado correctamente!');
           
            this.closeGroupModal();
            // Recargar datos
            await this.loadMuscleData();
           
        } catch (error) {
            console.error('Error guardando grupo:', error);
            this.showError('Error al guardar el grupo: ' + error.message);
        }
    }

    async saveSubgroup(e) {
        e.preventDefault();
        console.log('Guardando subgrupo muscular...');
       
        const name = document.getElementById('subgroup-name').value.trim();
        const parent = document.getElementById('subgroup-parent').value;
       
        if (!name || !parent) {
            this.showError('Por favor, completa todos los campos obligatorios');
            return;
        }
       
        const id = document.getElementById('subgroup-id').value;
        const subgroupData = {
            name: name,
            muscle_group: parseInt(parent),
            description: ''
        };
       
        console.log('Datos del subgrupo:', subgroupData);
        console.log('ID:', id);
       
        try {
            const options = {
                method: id ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken(),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(subgroupData)
            };

            const url = id ? `${this.apiBaseUrl}muscle-subgroups/${id}/` : `${this.apiBaseUrl}muscle-subgroups/`;
            console.log('Enviando a:', url, 'con método:', options.method);
           
            const response = await fetch(url, options);
           
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error del servidor:', errorData);
               
                let errorMessage = 'Error al guardar el subgrupo';
                if (errorData && typeof errorData === 'object') {
                    errorMessage = Object.values(errorData).flat().join(', ');
                }
               
                throw new Error(errorMessage);
            }
           
            const savedSubgroup = await response.json();
            console.log('Subgrupo guardado:', savedSubgroup);
           
            this.showSuccess(id ? 'Subgrupo actualizado correctamente!' : 'Subgrupo creado correctamente!');
           
            this.closeSubgroupModal();
            // Recargar datos
            await this.loadMuscleData();
           
        } catch (error) {
            console.error('Error guardando subgrupo:', error);
            this.showError('Error al guardar el subgrupo: ' + error.message);
        }
    }

    editMuscle(id, type) {
        if (type === 'group') {
            this.openGroupModal(id);
        } else if (type === 'subgroup') {
            this.openSubgroupModal(id);
        }
    }

    async deleteMuscle(id, type) {
        const muscle = type === 'group' 
            ? this.muscleGroups.find(g => g.id == id)
            : this.muscleSubgroups.find(s => s.id == id);
            
        if (!muscle) {
            this.showError('Músculo no encontrado');
            return;
        }

        const typeName = type === 'group' ? 'grupo' : 'subgrupo';
        const muscleName = muscle.name;
       
        if (!confirm(`¿Estás seguro de que deseas eliminar el ${typeName} "${muscleName}"? Esta acción no se puede deshacer.`)) {
            return;
        }

        try {
            console.log('Eliminando músculo ID:', id, 'tipo:', type);
           
            const endpoint = type === 'group' ? 'muscle-groups' : 'muscle-subgroups';
            const url = `${this.apiBaseUrl}${endpoint}/${id}/`;
           
            console.log('URL de eliminación:', url);
           
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': this.getCSRFToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json'
                }
            });
           
            console.log('Respuesta DELETE:', response.status);
           
            if (!response.ok) {
                let errorMessage = `Error ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorData.message || errorMessage;
                } catch (e) {
                    // No se pudo parsear JSON
                }
                throw new Error(errorMessage);
            }
           
            this.showSuccess(`${typeName === 'grupo' ? 'Grupo' : 'Subgrupo'} eliminado correctamente`);
           
            // Recargar datos
            await this.loadMuscleData();
           
        } catch (error) {
            console.error('Error eliminando músculo:', error);
            this.showError('Error al eliminar el músculo: ' + error.message);
        }
    }

    getCSRFToken() {
        // Buscar en cookies
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
        return cookieValue || '';
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