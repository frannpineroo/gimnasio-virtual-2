// entidades/static/entrenador/js/pages/musculos.js
class MusculosPage {
    constructor() {
        this.initialized = false;
        this.muscles = [];
        this.filteredMuscles = [];
        this.muscleGroups = [];
        this.currentMuscleId = null;
        this.searchTimeout = null;
        this.baseApiUrl = '/entrenador/api/muscles/';
    }

    initialize() {
        if (this.initialized) return;
        
        this.initialized = true;
        console.log('Inicializando página de músculos');
        
        this.initEventListeners();
        this.loadMuscles();
        this.loadMuscleGroups();
    }

    async loadMuscles() {
        try {
            console.log('Cargando músculos desde:', this.baseApiUrl);
            
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

            // Conectar con API real
            const response = await fetch(this.baseApiUrl);
            
            console.log('Respuesta HTTP:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Datos recibidos de API:', data);
            
            // Manejar diferentes formatos de respuesta
            let musclesData = data;
            
            if (data && typeof data === 'object' && data.results && Array.isArray(data.results)) {
                musclesData = data.results;
                console.log('Usando datos paginados, total:', musclesData.length);
            } else if (Array.isArray(data)) {
                console.log('Usando array directo, total:', musclesData.length);
            } else if (data && typeof data === 'object' && !Array.isArray(data)) {
                musclesData = [data];
                console.log('Convertido objeto único a array');
            } else {
                console.warn('Formato de datos inesperado:', data);
                musclesData = [];
            }
            
            this.muscles = musclesData;
            this.filteredMuscles = [...this.muscles];
            console.log('Músculos cargados:', this.muscles.length);
            
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

    async loadMuscleGroups() {
        try {
            console.log('Cargando grupos musculares para select...');
            
            // Usar el parámetro muscle_type=group según tu ViewSet
            const response = await fetch(this.baseApiUrl + '?muscle_type=group');
            
            console.log('Respuesta HTTP grupos:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Datos de grupos recibidos:', data);
            
            // Manejar diferentes formatos de respuesta
            let groupsData = data;
            
            if (data && typeof data === 'object' && data.results && Array.isArray(data.results)) {
                groupsData = data.results;
            } else if (Array.isArray(data)) {
                groupsData = data;
            } else if (data && typeof data === 'object' && !Array.isArray(data)) {
                groupsData = [data];
            } else {
                console.warn('Formato de datos de grupos inesperado:', data);
                groupsData = [];
            }
            
            this.muscleGroups = groupsData;
            console.log('Grupos musculares cargados:', this.muscleGroups.length);
            
            this.populateGroupSelect();
            
        } catch (error) {
            console.error('Error cargando grupos musculares:', error);
            this.muscleGroups = [];
            this.populateGroupSelect();
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
        
        console.log('Select de grupos actualizado con', this.muscleGroups.length, 'grupos');
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
            const name = muscle.name || 'N/A';
            const muscleType = muscle.muscle_type || muscle.type_display || 'subgroup';
            const parentName = muscle.parent_name || '-';
            const exercisesCount = muscle.exercises_count || 0;
            const id = muscle.id || muscle.pk || 0;
            
            return `
            <tr data-muscle-id="${id}">
                <td>${this.escapeHtml(name)}</td>
                <td>
                    <span class="type-badge type-${muscleType === 'group' || muscle.muscle_type === 'group' ? 'group' : 'subgroup'}">
                        ${muscleType === 'group' || muscle.muscle_type === 'group' ? 'Grupo' : 'Subgrupo'}
                    </span>
                </td>
                <td>${this.escapeHtml(parentName)}</td>
                <td>
                    <span class="exercises-count">
                        ${exercisesCount} ejercicios
                    </span>
                </td>
                <td>
                    <div class="actions-cell">
                        <button class="action-btn edit-btn" data-id="${id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" data-id="${id}" title="Eliminar">
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
                console.log('Editando músculo:', muscleId);
                this.editMuscle(muscleId);
            });
        });
        
        // Botones de eliminar
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const muscleId = button.getAttribute('data-id');
                console.log('Eliminando músculo:', muscleId);
                this.deleteMuscle(muscleId);
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
                    document.body.style.overflow = 'auto';
                }
            });
        });

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
        
        this.filteredMuscles = this.muscles.filter(muscle => {
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
        
        this.filteredMuscles = [...this.muscles];
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

    loadGroupData(id) {
        console.log('Cargando datos del grupo ID:', id);
        const muscle = this.muscles.find(m => m.id == id);
        if (muscle) {
            console.log('Grupo encontrado:', muscle);
            document.getElementById('group-id').value = muscle.id;
            document.getElementById('group-name').value = muscle.name || '';
        } else {
            console.error('Grupo no encontrado con ID:', id);
            this.showError('Grupo no encontrado');
        }
    }

    loadSubgroupData(id) {
        console.log('Cargando datos del subgrupo ID:', id);
        const muscle = this.muscles.find(m => m.id == id);
        if (muscle) {
            console.log('Subgrupo encontrado:', muscle);
            document.getElementById('subgroup-id').value = muscle.id;
            document.getElementById('subgroup-name').value = muscle.name || '';
            document.getElementById('subgroup-parent').value = muscle.parent || '';
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
            muscle_type: 'group',
            parent: null
        };
        
        console.log('Datos a guardar:', groupData);
        console.log('ID del equipo:', id);
        
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

            const url = id ? `${this.baseApiUrl}${id}/` : this.baseApiUrl;
            console.log('Enviando a:', url, 'con método:', options.method);
            
            const response = await fetch(url, options);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error del servidor:', errorData);
                
                // Mostrar errores de validación del servidor
                if (errorData) {
                    let errorMessages = [];
                    for (const [field, errors] of Object.entries(errorData)) {
                        if (Array.isArray(errors)) {
                            errorMessages.push(`${field}: ${errors.join(', ')}`);
                        } else {
                            errorMessages.push(`${field}: ${errors}`);
                        }
                    }
                    throw new Error(errorMessages.join('; '));
                }
                
                throw new Error(errorData.detail || errorData.message || `Error ${response.status}`);
            }
            
            const savedGroup = await response.json();
            console.log('Grupo guardado:', savedGroup);
            
            this.showSuccess(id ? 'Grupo actualizado correctamente!' : 'Grupo creado correctamente!');
            
            this.closeGroupModal();
            // Recargar músculos y grupos
            await this.loadMuscles();
            await this.loadMuscleGroups();
            
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
            muscle_type: 'subgroup',
            parent: parseInt(parent)
        };
        
        console.log('Datos a guardar:', subgroupData);
        console.log('ID del equipo:', id);
        
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

            const url = id ? `${this.baseApiUrl}${id}/` : this.baseApiUrl;
            console.log('Enviando a:', url, 'con método:', options.method);
            
            const response = await fetch(url, options);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error del servidor:', errorData);
                
                // Mostrar errores de validación del servidor
                if (errorData) {
                    let errorMessages = [];
                    for (const [field, errors] of Object.entries(errorData)) {
                        if (Array.isArray(errors)) {
                            errorMessages.push(`${field}: ${errors.join(', ')}`);
                        } else {
                            errorMessages.push(`${field}: ${errors}`);
                        }
                    }
                    throw new Error(errorMessages.join('; '));
                }
                
                throw new Error(errorData.detail || errorData.message || `Error ${response.status}`);
            }
            
            const savedSubgroup = await response.json();
            console.log('Subgrupo guardado:', savedSubgroup);
            
            this.showSuccess(id ? 'Subgrupo actualizado correctamente!' : 'Subgrupo creado correctamente!');
            
            this.closeSubgroupModal();
            // Recargar músculos
            await this.loadMuscles();
            
        } catch (error) {
            console.error('Error guardando subgrupo:', error);
            this.showError('Error al guardar el subgrupo: ' + error.message);
        }
    }

    editMuscle(id) {
        const muscle = this.muscles.find(m => m.id == id);
        if (!muscle) {
            this.showError('Músculo no encontrado');
            return;
        }

        if (muscle.muscle_type === 'group') {
            this.openGroupModal(id);
        } else {
            this.openSubgroupModal(id);
        }
    }

    async deleteMuscle(id) {
        const muscle = this.muscles.find(m => m.id == id);
        if (!muscle) {
            this.showError('Músculo no encontrado');
            return;
        }

        const typeName = muscle.muscle_type === 'group' ? 'grupo' : 'subgrupo';
        
        if (!confirm(`¿Estás seguro de que deseas eliminar el ${typeName} "${muscle.name}"? Esta acción no se puede deshacer.`)) {
            return;
        }

        try {
            console.log('Eliminando músculo ID:', id);
            
            const response = await fetch(`${this.baseApiUrl}${id}/`, {
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
            
            // Recargar músculos y grupos (si era grupo, actualizar select)
            await this.loadMuscles();
            if (muscle.muscle_type === 'group') {
                await this.loadMuscleGroups();
            }
            
        } catch (error) {
            console.error('Error eliminando músculo:', error);
            this.showError('Error al eliminar el músculo: ' + error.message);
        }
    }

    getCSRFToken() {
        // Primero buscar en un input hidden (en el modal)
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        if (csrfToken) {
            return csrfToken.value;
        }
        
        // Fallback: buscar en cookies
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